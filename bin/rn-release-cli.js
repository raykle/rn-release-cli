#!/usr/bin/env node
// --inspect-brk

const program = require('commander')
const path = require('path')
const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs')

const Prompt = require('../lib/prompt')

const join = path.join

const cliOptions = {
  reactNativeBundle: false,
  codePushRelease: false,
  bugsnagUpload: false,
}

const bundleOptions = {
  platform: 'ios',
  entryFile: '',
  bundlePath: '',
  bundleFileFolderName: '',
  bundleFileName: '',
  sourceMapFileFolderName: '',
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
  codeBundleId: '',
  apiKey: '',
}

const versionConfig = {
  fileName: '',
  key: {
    bugsnagUploadCodeBundleId: '',
    codePushReleaseDescription: '',
  },
}

const configFileName = 'rn-release.config.json'
const defaultConfig = require('../config/rn-release.config.json')
const Constants = require('../config/constants')

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
    } = cliOptions

    if (!reactNativeBundle && !codePushRelease && !bugsnagUpload) {
      reactNativeBundle = true
      codePushRelease = true
      bugsnagUpload = true
      Object.assign(cliOptions, { reactNativeBundle, codePushRelease, bugsnagUpload })
    }

    initDefaultConfig()
    console.log('')

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
      // done()
      // return

      if (reactNativeBundle) {
        await reactNativeBundleCmd()
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

program.parse(process.argv)

function help() { }

function triggerReactNativeBundle() {
  cliOptions.reactNativeBundle = true
}

function triggerCodePushRelease() {
  cliOptions.codePushRelease = true
}

function triggerBugsnagUpload() {
  cliOptions.bugsnagUpload = true
}

/* ********************************************************** */
/* *********************  Config handle  ******************** */
/* ********************************************************** */

async function initConfigWithPlatform() {
  const platform = await prompt.bundlePlatformChoice()
  handleDefaultPlatformConfig(platform)
  mergeConfigFromProject(platform)
}

function initDefaultConfig() {
  const {
    bundleOptions: defaultBundleOptions,
    codePushOptions: defaultCodePushOptions,
    bugsnagOptions: defaultBugsnagOptions,
    versionConfig: defaultVersionConfig,
  } = defaultConfig

  bundleOptions.entryFile = defaultBundleOptions.entryFile
  bundleOptions.bundlePath = defaultBundleOptions.bundleRootPath
  bundleOptions.bundleFileFolderName = defaultBundleOptions.bundleFileFolderName
  bundleOptions.sourceMapFileFolderName = defaultBundleOptions.sourceMapFileFolderName

  bugsnagOptions.apiKey = defaultBugsnagOptions.apiKey

  Object.assign(versionConfig, defaultVersionConfig)
}

function handleDefaultPlatformConfig(platform) {
  bundleOptions.platform = platform
  bundleOptions.bundlePath = join(bundleOptions.bundlePath, platform)

  const {
    bundleOptions: defaultBundleOptions,
    codePushOptions: defaultCodePushOptions,
  } = defaultConfig
  const { bundleFileName, sourceMapFileName } = defaultBundleOptions[platform]
  bundleOptions.bundleFileName = bundleFileName
  bundleOptions.sourceMapFileName = sourceMapFileName

  const { appName } = defaultCodePushOptions[platform]
  codePushOptions.appName = appName
}

// function

function mergeConfigFromProject(platform) {
  // rn-release.config.json
  const projectConfigFilePath = join(process.cwd(), configFileName)

  let projectRnReleaseConfig = {}
  if (fs.existsSync(projectConfigFilePath)) {
    projectRnReleaseConfig = require(projectConfigFilePath)
  }

  let {
    bundleOptions: projectBundleOptions,
    codePushOptions: projectCodePushOptions,
    bugsnagOptions: projectBugsnagOptions,
    versionConfig: projectVersionConfig,
  } = projectRnReleaseConfig || {}

  if (!projectBundleOptions || typeof projectBundleOptions !== 'object') { projectBundleOptions = {} }
  if (!projectCodePushOptions || typeof projectCodePushOptions !== 'object') { projectCodePushOptions = {} }
  if (!projectBugsnagOptions || typeof projectBugsnagOptions !== 'object') { projectBugsnagOptions = {} }

  // bundleOptions
  const { [platform]: platformBundleOptions = {} } = projectBundleOptions

  if (projectBundleOptions.bundleRootPath) {
    bundleOptions.bundlePath = join(projectBundleOptions.bundleRootPath, platform)
  }

  delete projectBundleOptions.ios
  delete projectBundleOptions.android
  delete projectBundleOptions.bundlePath
  delete projectBundleOptions.bundleRootPath

  Object.assign(bundleOptions, platformBundleOptions, projectBundleOptions)

  // codePushOptions
  const { [platform]: platformCodePushOptions = {} } = projectCodePushOptions
  delete projectCodePushOptions.ios
  delete projectCodePushOptions.android
  Object.assign(codePushOptions, platformCodePushOptions)

  // versionConfig 配置检测
  const {
    fileName: projVersionConfigFileName,
    key: projVersionConfigKeyConfig,
  } = projectVersionConfig || {}

  if (projVersionConfigFileName) {
    versionConfig.fileName = projVersionConfigFileName
  }

  if (projVersionConfigKeyConfig) {
    const { key: keyConfig } = versionConfig
    const newVersionConfigKeyConfig = Object.assign({}, keyConfig, projVersionConfigKeyConfig)
    versionConfig.key = newVersionConfigKeyConfig
  }

  const { fileName: versionConfigFileName, key: versionConfigKeyConfig } = versionConfig

  if (!versionConfigFileName) {
    fail(`未指定 \`rn-release.config.json\` 中属性值：\`versionConfig.fileName\``);
  }

  const { bugsnagUploadCodeBundleId, codePushReleaseDescription } = versionConfigKeyConfig
  if (!bugsnagUploadCodeBundleId) {
    fail(`未指定 \`rn-release.config.json\` 中属性值：\`versionConfig.key.bugsnagUploadCodeBundleId\``);
  }

  // version file 配置检测
  const projVersionConfigFilePath = join(process.cwd(), versionConfigFileName)

  let projVersionConfigObj = {}
  if (fs.existsSync(projVersionConfigFilePath)) {
    projVersionConfigObj = require(projVersionConfigFilePath) || {}
  }

  const { codePushRelease, bugsnagUpload } = cliOptions

  // codePush 配置检测
  if (codePushRelease) {
    if (!codePushOptions.appName) {
      console.log('')
      fail(`未配置 \`rn-release.config.json\`，或未配置 codePushOptions ${platform} 平台的 \`appName\``);
    }

    if (!codePushReleaseDescription) {
      codePushOptions.desc = ''
    } else {
      const descValue = projVersionConfigObj[codePushReleaseDescription] || ''
      let desc = ''
      if (typeof descValue === 'string') {
        desc = descValue
      }
      // else if (Object.prototype.toString.call(descValue) === '[object Array]') {
      //   // 是个 Array，永远取第一个值
      //   if (descValue.length > 0) {
      //     const firstDescObj = descValue[0]
      //     if (typeof firstDescObj === 'string') {
      //       desc = firstDescObj
      //     } else {
      //       desc = JSON.stringify(firstDescObj)
      //     }
      //   }
      // } else if (Object.prototype.toString.call(descValue) === '[object Object]') {
      //   desc = JSON.stringify(descValue)
      // }
      codePushOptions.desc = desc
    }
  }

  // bugsnagOptions
  if (bugsnagUpload) {
    Object.assign(bugsnagOptions, projectBugsnagOptions)

    const bugsnagCodeBundleId = projVersionConfigObj[bugsnagUploadCodeBundleId]
    bugsnagOptions.codeBundleId = bugsnagCodeBundleId

    if (!bugsnagOptions.apiKey) {
      fail(`未配置 \`rn-release.config.json\`，或未配置 bugsnagOptions 的 \`apiKey\``);
    }

    if (!bugsnagOptions.codeBundleId) {
      fail(`未配置 \`${versionConfig.fileName}\`，或未配置 \`${versionConfig.key.bugsnagUploadCodeBundleId}\``);
    }
  }
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
    fail(`请确认 '${versionConfig.fileName}' 中 '${versionConfig.key.codePushReleaseDescription}' 的值`)
  }
}

async function bugsnagPromptHandle() {
  const bundleIdConfirmed = await prompt.bugsnagBundleIdConfirm(bugsnagOptions.codeBundleId)
  if (!bundleIdConfirmed) {
    console.log('')
    fail(`请确认 '${versionConfig.fileName}' 中 '${versionConfig.key.bugsnagUploadCodeBundleId}' 的值`)
  }
}

/* ********************************************************** */
/* *********************  Command handle ******************** */
/* ********************************************************** */

function reactNativeBundleCmd() {
  // react-native 打包
  return require('../lib/bundle')(bundleOptions)
}

function codePushCmd() {
  // code-push 上传
  const { bundlePath, bundleFileFolderName } = bundleOptions
  const bundleFileFolderPath = join(process.cwd(), bundlePath, bundleFileFolderName)
  return require('../lib/code-push')({ ...codePushOptions, bundlePath: bundleFileFolderPath })
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
  const {
    bundlePath,
    bundleFileFolderName,
    sourceMapFileFolderName,
    bundleFileName,
    sourceMapFileName
  } = bundleOptions
  const dest = join(process.cwd(), bundlePath)
  const bundleFilePath = join(dest, bundleFileFolderName, bundleFileName)
  const sourceMapFilePath = join(dest, sourceMapFileFolderName, sourceMapFileName)
  return { bundleFileName, bundleFilePath, sourceMapFilePath }
}

function logOptions() {
  console.log('bundleOptions: ', JSON.stringify(bundleOptions))
  console.log('codePushOptions: ', JSON.stringify(codePushOptions))
  console.log('bugsnagOptions: ', JSON.stringify(bugsnagOptions))
  console.log('versionConfig: ', JSON.stringify(versionConfig))
}

function done() {
  console.log(`\n🎉 ${Constants.RNReleaseCLI} ${chalk.bgGreen.white('done')}`)
  process.exit(0)
}

function fail(failMsg = '') {
  if (failMsg) {
    ora().fail(chalk.dim(failMsg));
  }
  process.exit(1)
}
