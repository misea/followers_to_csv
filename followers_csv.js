import Papa from "papaparse";
import fs from "node:fs";
import { load } from "cheerio";
import { getFollowers, canonicalHandle, splitHandle } from "./accounts.js";

function extractKeywords(note) {
    const keywords = [];
    if (note.indexOf("hashtag") !== -1) {
        let $ = load(note)
        let aTags = $('a.hashtag');
        aTags.each((i, e) => keywords.push($(e).text()));
    }
    return keywords.map(k => k.indexOf("#") === 0 ? k.substring(1) : k);
}

function accountsToCsv(accounts, instance, csvPath) {
    // fs.writeFileSync("accounts.json", JSON.stringify(followers, undefined, 2))
    const csvData = accounts.map(account => {
        const accountHandle = canonicalHandle(account.acct, instance);
        return {
            "Account address": accountHandle,
            name: account.display_name || splitHandle(accountHandle).userName,
            keywords: extractKeywords(account.note).join(' ')
        }
    })
    fs.writeFileSync(csvPath, Papa.unparse(csvData, {columns:["Account address", "name", "keywords"]}));
    return csvData;
}

export async function saveFollowersCsv(handle, csvPath) {
    const { instance } = splitHandle(handle);
    const accounts = await getFollowers(handle)
    accountsToCsv(accounts, instance, csvPath);
}

//Should check if called from command line to allow reuse, but just a util for now
if (process.argv.length !== 4) {
    console.log("Usage: node followers_csv.js @user@instance csvfile_path.csv")
} else {
    const handle = process.argv[2];
    const csvPath = process.argv[3];
    if (!handle.indexOf("@") === 0 || !handle.lastIndexOf("@") > 0) {
        console.error("Handle must be of form @user@instance");
        process.exit(1);
    }
    await saveFollowersCsv(handle, csvPath);
    console.log(`csv file saved to ${csvPath}`);
}


