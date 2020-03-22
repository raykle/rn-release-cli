#!/usr/bin/env node
// --inspect-brk

const program = require('commander')
const path = require('path')
const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs')

const Prompt = require('../lib/prompt')

const join = path.join

const bundleOptions = {
  platform: 'ios',
  entryFile: '',
  bundlePath: '',
  bundleFileName: '',
  sourceMapFileName: '',
  resetCache: false,
}

const codePushOptions = {
  appName: "",
  targetBinaryVersion: "",
  desc: "",
  deploymentName: "Staging"
};

const bugsnagOptions = {
  version: '',
  apiKey: '',
}

const releaseOptions = {
  reactNativeBundle: false,
  codePushRelease: false,
  bugsnagUpload: false,
}

const defaultConfig = require('../config/rn-release.config.json')
const Constants = require('../lib/constants')

const prompt = new Prompt()

/* ********************************************************** */
/* ********************************************************** */

program
  .version(require('../package.json').version, '-v, --version')
  .usage('<cmd>')
  .on('-h, --help', help)

/* ********************************************************** */
/* ********************************************************** */

program
  .command('release')
  .description('Collection command of react-native bundle, release to code-push and upload sourcemap to bugsnag.')
  .option('--bundle', '', triggerReactNativeBundle)
  .option('--codepush', '', triggerCodePushRelease)
  .option('--bugsnag', '', triggerBugsnagUpload)
  .action(async () => {
    let {
      reactNativeBundle,
      codePushRelease,
      bugsnagUpload,
    } = releaseOptions

    if (!reactNativeBundle && !codePushRelease && !bugsnagUpload) {
      reactNativeBundle = true
      codePushRelease = true
      bugsnagUpload = true
    }

    await initConfigWithPlatform()

    try {
      if (reactNativeBundle) {
        await reactNativePromptHandle()
      }
      if (codePushRelease) {
        await codePushPromptHandle()
      }
      if (bugsnagUpload) {
        await bugsnagPromptHandle()
      }
      promptComplete()

      if (reactNativeBundle) {
        await reactNativeCmd()
      }
      if (codePushRelease) {
        await codePushCmd()
      }
      if (bugsnagUpload) {
        await bugsnagCmd()
      }

      done()
    } catch (err) {
      fail()
    }
  })

/**
program
  .command('bundle')
  .description('[react-native bundle] command')
  .action(async () => {
    await initConfigWithPlatform()
    try {
      await reactNativePromptHandle()
      promptComplete()
      await reactNativeCmd()
      done()
    } catch (err) {
      fail()
    }
  })

program
  .command('codepush')
  .description('[code-push release] command')
  .action(async () => {
    await initConfigWithPlatform()
    try {
      await codePushPromptHandle()
      promptComplete()
      await codePushCmd()
      done()
    } catch (err) {
      fail()
    }
  })

program
  .command('bugsnag')
  .description('[bugsnag-sourcemaps upload] command')
  .action(async () => {
    await initConfigWithPlatform()
    try {
      await bugsnagPromptHandle()
      promptComplete()
      await bugsnagCmd()
      done()
    } catch (err) {
      fail()
    }
  })
 */

program.parse(process.argv)

function help() { }

function triggerReactNativeBundle() {
  releaseOptions.reactNativeBundle = true
}

function triggerCodePushRelease() {
  releaseOptions.codePushRelease = true
}

function triggerBugsnagUpload() {
  releaseOptions.bugsnagUpload = true
}

/* ********************************************************** */
/* *********************  Config handle  ******************** */
/* ********************************************************** */

async function initConfigWithPlatform() {
  initDefaultConfig()
  console.log('')
  const platform = await prompt.bundlePlatformChoice()
  handlePlatform(platform)
  mergeConfigFromProject(platform)
}

function initDefaultConfig() {
  const {
    bundleOptions: defaultBundleOptions,
    codePushOptions: defaultCodePushOptions,
    bugsnagOptions: defaultBugsnagOptions
  } = defaultConfig

  bundleOptions.entryFile = defaultBundleOptions.entryFile
  bundleOptions.bundlePath = defaultBundleOptions.bundlePath
  bugsnagOptions.apiKey = defaultBugsnagOptions.apiKey
}

function handlePlatform(platform) {
  bundleOptions.platform = platform
  // bundleOptions.bundlePath = join(process.cwd(), bundleOptions.bundlePath, platform)
  bundleOptions.bundlePath = bundleOptions.bundlePath + '/' + platform

  const {
    bundleOptions: defaultBundleOptions,
    codePushOptions: defaultCodePushOptions,
  } = defaultConfig
  Object.assign(bundleOptions, defaultBundleOptions[platform])
  Object.assign(codePushOptions, defaultCodePushOptions[platform])
}

function mergeConfigFromProject(platform) {
  // package.json
  const projectPackageJSONPath = join(process.cwd(), './package.json')
  if (!fs.existsSync(projectPackageJSONPath)) {
    ora().fail('当前文件夹不存在 `package.json` 文件')
    fail()
  }

  const projectPackageJSON = require(projectPackageJSONPath)
  const {
    version: packageJSONVersion,
    description: packageJSONDesc = '',
    newFeatures: packageJSONNewFeatures = '',
  } = projectPackageJSON

  if (!packageJSONVersion || packageJSONVersion.length === 0) {
    ora().fail('package.json 中 `version` 为空')
    fail()
  }

  // codePushOptions
  codePushOptions.desc = JSON.stringify({
    desc: packageJSONDesc,
    newFeatures: packageJSONNewFeatures,
  })

  // bugsnagOptions
  bugsnagOptions.version = packageJSONVersion


  // rn-release.config.json
  const projectConfigFilePath = join(process.cwd(), './rn-release.config.json')
  if (!fs.existsSync(projectConfigFilePath)) {
    return
  }

  const projectRnReleaseConfig = require(projectConfigFilePath)
  let {
    bundleOptions: projectBundleOptions,
    codePushOptions: projectCodePushOptions,
    bugsnagOptions: projectBugsnagOptions
  } = projectRnReleaseConfig || {}

  if (!projectBundleOptions || typeof projectBundleOptions !== 'object') { projectBundleOptions = {} }
  if (!projectCodePushOptions || typeof projectCodePushOptions !== 'object') { projectCodePushOptions = {} }
  if (!projectBugsnagOptions || typeof projectBugsnagOptions !== 'object') { projectBugsnagOptions = {} }

  // bundleOptions
  const { [platform]: platformBundleOptions = {} } = projectBundleOptions
  bundleOptions.bundlePath = projectBundleOptions.bundlePath + '/' + platform
  delete projectBundleOptions.ios
  delete projectBundleOptions.android
  delete projectBundleOptions.bundlePath
  Object.assign(bundleOptions, platformBundleOptions, projectBundleOptions)

  // codePushOptions
  const { [platform]: platformCodePushOptions = {} } = projectCodePushOptions
  delete projectCodePushOptions.ios
  delete projectCodePushOptions.android
  Object.assign(codePushOptions, platformCodePushOptions)

  if (codePushOptions.appName.length === 0) {
    console.log('')
    ora().fail(`未配置 \`rn-release.config.json\`，或未配置 [code-push] ${platform} 平台的 \`appName\``);
    fail()
  }

  // bugsnagOptions
  Object.assign(bugsnagOptions, projectBugsnagOptions)
}

/* ********************************************************** */
/* *********************  Prompt handle  ******************** */
/* ********************************************************** */

async function reactNativePromptHandle() {
  // react-native reset-cache 确认
  const isBundleResetCache = await prompt.bundleResetCacheConfirm()
  bundleOptions.resetCache = isBundleResetCache
}

async function codePushPromptHandle() {
  const spinner = ora()
  // code-push 平台选择
  const codePushDepName = await prompt.codePushDepNameChoice()
  codePushOptions.deploymentName = codePushDepName;

  // code-push 目标版本输入
  const codePushTargetVersion = await prompt.codePushTargetVersionInput()
  codePushOptions.targetBinaryVersion = codePushTargetVersion

  // code-push 描述确认
  const codePushDescConfirmed = await prompt.codePushDescConfirm(codePushOptions.desc)
  if (!codePushDescConfirmed) {
    console.log('')
    spinner.fail('请修改 `package.json` 中 `description` 的值后，重新发布')
    fail()
  }
}

async function bugsnagPromptHandle() {
  const bundleIdConfirmed = await prompt.bugsnagBundleIdConfirm(bugsnagOptions.version)
  if (!bundleIdConfirmed) {
    console.log('')
    ora().fail('请修改 `package.json` 中 `version` 的值后，重新发布')
    fail()
  }
}

/* ********************************************************** */
/* *********************  Command handle ******************** */
/* ********************************************************** */

function reactNativeCmd() {
  // react-native 打包
  return require('../lib/bundle')(bundleOptions)
}

function codePushCmd() {
  // code-push 上传
  return require('../lib/code-push')({ ...codePushOptions, bundlePath: bundleOptions.bundlePath })
}

function bugsnagCmd() {
  // bugsnag 上传
  const uploadOptions = bugsnagUploadOptions()
  return require('../lib/bugsnag')({ ...bugsnagOptions, ...uploadOptions })
}

/* ********************************************************** */
/* *************************  Utils ************************* */
/* ********************************************************** */

function promptComplete() {
  console.log('')
  // logOptions()
}

function bugsnagUploadOptions() {
  const { bundlePath, bundleFileName, sourceMapFileName } = bundleOptions
  const dest = join(process.cwd(), bundlePath)
  const bundleFolderPath = join(dest, Constants.BundleFolderName)
  const bundleFilePath = join(bundleFolderPath, bundleFileName)
  const sourceMapFilePath = join(dest, Constants.SourceMapFolderName, sourceMapFileName)
  return { bundleFileName, bundleFilePath, sourceMapFilePath }
}

function logOptions() {
  console.log('bundleOptions: ', JSON.stringify(bundleOptions))
  console.log('codePushOptions: ', JSON.stringify(codePushOptions))
  console.log('bugsnagOptions: ', JSON.stringify(bugsnagOptions))
}

function done() {
  console.log(`\n🍻 ${Constants.RNReleaseCLI} ${chalk.bgGreen.white('done')}`)
  process.exit(0)
}

function fail() {
  process.exit(1)
}
