export async function getAccount(handle) {
  handle = canonicalHandle(handle);
  const {instance} = splitHandle(handle);

  let accountArray = []
  try {
      const ret = await getPublicJson(instance, "/api/v2/search", {q:handle, type:"accounts", limit:1});
      accountArray = ret.accounts || [];    
  } catch (e) {
    console.error(e);
    throw new Error(`Error attempting to get account information for ${handle}`);
  }

  if (accountArray.length >= 1) {
      return accountArray[0];
  } else {
      throw new Error(`No account found for ${handle}`)
  }
}

export function splitHandle(handle) {
  const a = handle.split("@");
  return {userName:a[a.length - 2], instance:a[a.length - 1]}
}

export function canonicalHandle(handle, userInstance = null) {
  handle = handle.trim();
  if(!handle.startsWith("@")) {
      handle = "@" + handle;
  }
  if (handle.lastIndexOf("@") === 0 && userInstance) {
      handle = `${handle}@${userInstance}`
  }
  return handle;
}

export async function getFollowers(handle) {
  //No non-public information is recorded
  //const headers =  { "Content-Type": "application/json", authorization:`Bearer ${loginInfo.accessToken}`};
  const headers =  { "Content-Type": "application/json"};

  const account = await getAccount(handle);
  const accountId = account.id;
  const MAX_ACCOUNTS = 4000; //50 requests

  async function getBatch(url) {
      console.log(url);
      const res = await fetch(url, {headers:headers});
      if (!res.ok) {
          //TODO: supply message not just code
          throw new Error(`${res.code}: Error fetching ${url}`);
      }
      const link = res.headers.get("Link");
      let nextUrl = null;
      if (link) {
          const matches = link.matchAll(/<([^>]+)>; *rel=["']([^'"]+)['"]/g);
          for (let match of matches) {
              if(match[2] === "next") {
                  nextUrl = match[1]
              }
          }
      }
      const accounts = await res.json();
      return {accounts, nextUrl}
  }

  const followers = [];
  const {instance} = splitHandle(handle);
  let url = `https://${instance}/api/v1/accounts/${accountId}/followers?limit=80`
  while (url && followers.length < MAX_ACCOUNTS) {
      let batch = await getBatch(url);
      batch.accounts.forEach(account=>{
          followers.push(account)
      });
      url = batch.nextUrl;
  }
  if (followers.length >= MAX_ACCOUNTS) {
    console.log(`Account list may be incomplete, no more than ${MAX_ACCOUNTS} supported.`)
  }

  return followers;
}

async function getPublicJson(instance, path, params) {
  const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
  const headers =  { "Content-Type": "application/json" };
  if (path.startsWith("/")) {
      path = path.substring(1);
  }
  const url = `https://${instance}/${path}${queryString}`
  const res = await fetch(url, {
      headers:headers
  });
  if (!res.ok) {
      throw new Error(`${res.code}: Error fetching ${path}`)
  }
  const data = await res.json();
  return data;
}

