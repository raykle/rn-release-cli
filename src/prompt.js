const inquirer = require('inquirer')
const chalk = require('chalk')
const path = require('path')

const ReactNativePrompt = chalk.bold.blue('[react-native]')
const CodePushPrompt = chalk.bold.blue('[code-push]')
const BugsnagPrompt = chalk.bold.blue('[bugsnag]')

class Prompt {
  constructor(bundleOptions, codePushOptions, bugsnagOptions) {
    this.bundleOptions = bundleOptions
    this.codePushOptions = codePushOptions
    this.bugsnagOptions = bugsnagOptions

    this.defaultConfig = require('../config/rn-release.json')
  }

  /* ********************************************************** */
  /* *********************  react-native  ********************* */
  /* ********************************************************** */

  bundlePlatformChoice() {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'platform',
            message: `${ReactNativePrompt} 请选择打包平台`,
            choices: [
              {
                name: 'iOS',
                value: 'ios'
              },
              {
                name: 'Android',
                value: 'android'
              }
            ]
          }
        ])
        .then(({ platform }) => {
          resolve(platform)
        })
    })
  }

  bundleEntryFileConfirm(entryFile) {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: 'confirm',
            name: 'entryFileConfirm',
            message: `${ReactNativePrompt} 确定打包入口文件 (${entryFile})`,
            default: true
          }
        ])
        .then(({ entryFileConfirm }) => {
          // resolve(entryFileConfirm)
          if (!entryFileConfirm) {
            return this.bundleEntryFileInput()
          } else {
            resolve()
          }
        })
    })
  }

  bundleEntryFileInput() {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'entryFileName',
            message: `${ReactNativePrompt} 请输入打包入口文件名称`,
            default: 'index.js'
          }
        ])
        .then(({ entryFileName }) => {
          resolve(entryFileName)
        })
    })
  }

  bundleResetCacheConfirm() {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: 'confirm',
            name: 'isBundleResetCache',
            message: `${ReactNativePrompt} 是否 reset-cache？`,
            default: false
          }
        ])
        .then(({ isBundleResetCache }) => {
          resolve(isBundleResetCache)
        })
    })
  }

  /* ********************************************************** */
  /* **********************  code-push  *********************** */
  /* ********************************************************** */

  codePushEnvChoice() {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'env',
            message: `${CodePushPrompt} 请选择发布环境`,
            choices: [
              {
                name: 'Staging',
                value: 'Staging'
              },
              {
                name: 'Production',
                value: 'Production'
              }
            ]
          }
        ])
        .then(({ env }) => {
          resolve(env)
        })
    })
  }

  codePushTargetVersionInput() {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'targetBinaryVersion',
            message: `${CodePushPrompt} 请输入适配的 App 版本号`,
            validate: (input) => {
              if (input === '1.0') {
                return true
              }
              return '请输入正确的版本号（eg: 1.0 或者 1.0-2.0）'
            }
          }
        ])
        .then(({ targetBinaryVersion }) => {
          resolve(targetBinaryVersion)
        })
    })
  }

  codePushDescConfirm(desc) {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: 'confirm',
            name: 'codePushDescConfirmed',
            message: `${CodePushPrompt} 请确认描述：👇\n\"${desc}\"`,
            default: true
          }
        ])
        .then(({ codePushDescConfirmed }) => {
          resolve(codePushDescConfirmed)
        })
    })
  }

  /* ********************************************************** */
  /* ***********************  bugsnag  ************************ */
  /* ********************************************************** */

}

module.exports = Prompt
