const spawn = require("cross-spawn");
const ora = require('ora')
const chalk = require('chalk')

const Constants = require("../config/constants");
const succeedPrompt = chalk.bold.green(Constants.CodePushPromptStr)
const failPrompt = chalk.bold.red(Constants.CodePushPromptStr)
const infoPrompt = chalk.redBright.cyan(Constants.CodePushPromptStr)

function codePush(options) {
  return new Promise(async (resolve, reject) => {
    try {
      await releaseBundle(options)
      resolve()
    } catch (err) {
      reject(err)
      process.exit(1)
    }
  })
}

function releaseBundle(options) {
  return new Promise((resolve, reject) => {
    const {
      appName,
      deploymentName,
      bundlePath,
      targetBinaryVersion,
      desc
    } = options;

    const codePushArgs = [
      "release", appName,
      bundlePath, targetBinaryVersion,
      "--description", desc,
      "--deploymentName", deploymentName,
      "--noDuplicateReleaseError", true
    ]

    console.log(`--------------------------------`);
    console.log(`${infoPrompt} args: `, codePushArgs)
    console.log(`--------------------------------`);

    const loading = `${Constants.RNReleaseCLI} code-push 上传中...`
    const spinner = ora(loading);
    spinner.start();

    let releaseProcess
    releaseProcess = spawn.sync(
      "code-push",
      codePushArgs,
      {
        stdio: 'inherit',
        // detached: true
      }
    );

    if (releaseProcess.status !== 0) {
      if (releaseProcess.error) {
        console.log('Error: ', releaseProcess.error.message)
        spinner.fail(`${Constants.RNReleaseCLI} ${releaseProcess.error.message || ''}`)
      } else {
        spinner.fail(`${failPrompt} 上传失败`)
      }
      reject()
      return
    }

    spinner.succeed(`${succeedPrompt} 上传成功`)
    resolve()
  })
}

module.exports = codePush
