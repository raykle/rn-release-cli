const ora = require('ora')
const chalk = require('chalk')
const upload = require('bugsnag-sourcemaps').upload

const Constants = require("../config/constants");
const succeedPrompt = chalk.bold.green(Constants.BugsnagPromptStr)
const failPrompt = chalk.bold.red(Constants.BugsnagPromptStr)
const infoPrompt = chalk.redBright.cyan(Constants.BugsnagPromptStr)

function bugsnagUpload(options) {
  return new Promise(async (resolve, reject) => {
    try {
      await uploadSourceMap(options)
      resolve()
    } catch (err) {
      reject(err)
      process.exit(1)
    }
  })
}

function uploadSourceMap(options) {
  return new Promise((resolve, reject) => {
    const {
      apiKey,
      codeBundleId,
      bundleFilePath,
      bundleFileName,
      sourceMapFilePath,
    } = options

    const bugsnagOptions = {
      apiKey,
      codeBundleId,
      minifiedFile: bundleFilePath,
      minifiedUrl: bundleFileName,
      sourceMap: sourceMapFilePath,
      overwrite: false,
      uploadSources: true,
      addWildcardPrefix: true
    }

    console.log(`--------------------------------`);
    console.log(`${infoPrompt} args: `, bugsnagOptions)
    console.log(`--------------------------------`);

    const loading = `${Constants.RNReleaseCLI} bugsnag 上传中...`
    const spinner = ora(loading);
    spinner.start();

    upload(bugsnagOptions, (err, message) => {
      if (err) {
        spinner.fail(`${failPrompt} ${err.message}`)
        reject(err.message)
        return
      }
      spinner.succeed(`${succeedPrompt} source map 上传成功`)
      resolve()
    })
  })
}

module.exports = bugsnagUpload
