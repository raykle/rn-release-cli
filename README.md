# rn-release-cli

[![npm version](https://badge.fury.io/js/rn-release-cli.svg)](//npmjs.com/package/rn-release-cli)
[![downloads](https://img.shields.io/npm/dt/rn-release-cli.svg?maxAge=2592000)](https://www.npmjs.com/package/rn-release-cli)


[![npm package](https://nodei.co/npm/rn-release-cli.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/rn-release-cli/)

Generic CLI tool for react-native project to automate executing cmd `react-native bundle`, `code-push release` and `bugsnag upload`.

## Installation

```
$ npm install -g rn-release-cli
```

## Usage

Step 1:

Create a new file named [rn-release.config.json](./config/rn-release.config.json) in your react-native root directory, then set the variable in the json file if needed. Otherwise, the command will use the default value.

Step 2:

```
$ cd ./Awesome-react-native
$ rn-release
```

`rn-release` is the same as command: `rn-release --bundle --codepush --bugsnag`.

<br>

_Note_: If execute the command with bouth `--codepush` and `--bugsnag` options, but the `deploymentName` args for `code-push` choose the `Staging`, the `bugsnag upload` command will be _skipped_.

For example: `rn-release --codepush --bugsnag`, `--bugsnag` option will be skipped if choose the `Staging` for `deploymentName`.

<br>

Use `rn-release -h` for more help.

<p> <img src="./assets/help@2x.png" alt="raykle" width=1000 /> <p>

## Example

<!-- ![screenshot](./assets/example@2x.png) -->
<p> <img src="./assets/example@2x.png" alt="raykle" width=1000 /> <p>

## License

[MIT](./LICENSE)

<br/>

<!-- [![buymeacoffee](./assets/buymeacoffee.svg)](https://www.buymeacoffee.com/raykle) -->
<!-- <a href="https://www.buymeacoffee.com/raykle" target="_blank"><img src="./assets/buymeacoffee.png" alt="Buy Me A Coffee" width="181"/></a> -->
