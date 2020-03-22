const inquirer = require('inquirer')
const chalk = require('chalk')

const Constants = require("./constants");

const taskPromptFormat = chalk.bold.magenta
const ReactNativeTaskPrompt = taskPromptFormat(Constants.ReactNativePromptStr)
const CodePushTaskPrompt = taskPromptFormat(Constants.CodePushPromptStr)
const BugsnagTaskPrompt = taskPromptFormat(Constants.BugsnagPromptStr)

class Prompt {
  constructor(bundleOptions, codePushOptions, bugsnagOptions) {
    this.bundleOptions = bundleOptions
    this.codePushOptions = codePushOptions
    this.bugsnagOptions = bugsnagOptions
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
            message: `${ReactNativeTaskPrompt} 请选择打包平台`,
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
            type: "confirm",
            name: "entryFileConfirm",
            message: `${ReactNativeTaskPrompt} 确定打包入口文件 (${entryFile})`,
            default: true
          }
        ])
        .then(({ entryFileConfirm }) => {
          // resolve(entryFileConfirm)
          if (!entryFileConfirm) {
            return this.bundleEntryFileInput();
          } else {
            resolve();
          }
        });
    })
  }

  bundleEntryFileInput() {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: "input",
            name: "entryFileName",
            message: `${ReactNativeTaskPrompt} 请输入打包入口文件名称`,
            default: "index.js"
          }
        ])
        .then(({ entryFileName }) => {
          resolve(entryFileName);
        });
    })
  }

  bundleResetCacheConfirm() {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: "confirm",
            name: "isBundleResetCache",
            message: `${ReactNativeTaskPrompt} 是否 reset-cache？`,
            default: false
          }
        ])
        .then(({ isBundleResetCache }) => {
          resolve(isBundleResetCache);
        });
    })
  }

  /* ********************************************************** */
  /* **********************  code-push  *********************** */
  /* ********************************************************** */

  codePushDepNameChoice() {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'env',
            message: `${CodePushTaskPrompt} 请选择发布环境`,
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
            type: "input",
            name: "targetBinaryVersion",
            message: `${CodePushTaskPrompt} 请输入匹配的原生 App 版本号`,
            validate: input => {
              if (input.length > 0) {
                return true;
              }
              return "请输入正确的版本号（eg: 1.0 或者 1.0-2.0）";
            }
          }
        ])
        .then(({ targetBinaryVersion }) => {
          resolve(targetBinaryVersion);
        });
    })
  }

  codePushDescConfirm(desc) {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: "confirm",
            name: "codePushDescConfirmed",
            message: `${CodePushTaskPrompt} 请确认描述：${desc}`,
            default: false
          }
        ])
        .then(({ codePushDescConfirmed }) => {
          resolve(codePushDescConfirmed);
        });
    })
  }

  /* ********************************************************** */
  /* ***********************  bugsnag  ************************ */
  /* ********************************************************** */

  bugsnagBundleIdConfirm(bundleId) {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: "confirm",
            name: "codeBundleIdConfirmed",
            message: `${BugsnagTaskPrompt} 请确认 bundleId：${bundleId}`,
            default: false
          }
        ])
        .then(({ codeBundleIdConfirmed }) => {
          resolve(codeBundleIdConfirmed);
        });
    })
  }
}

module.exports = Prompt
