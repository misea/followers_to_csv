# followers_to_csv

This repository contains a script to export a *public* Mastodon account's followers to a csv file similar to those
used in many of the [Academics of Mastodon](https://nathanlesage.github.io/academics-on-mastodon/) lists,
which are also compatible with [find.sciences.social](https://find.sciences.social).

The generated file contains 3 columns:

- name: taken from the Display Name of the following account
- handle: The full Mastodon handle of the follower
- keywords: These are the hashtags extracted from the account description

A future version include validated urls information from custom fields.

## Setup

To run you will need a [node.js installation](https://nodejs.org/en/download/). 

Then download or clone this repository. Before you run the *first time* you will have to run

`npm i`

from the command line in the root directory in order to install libraries. 

## Usage

From the command line in the root directory run

`node followers_csv.js @user@instance csvfile_path.csv`

For example

`node followers_csv.js @markigra@sciences.social marks_followers.csv`

The script will fail if the account is not public or if the instance blocks public requests for user account information or followers. That's a feature



