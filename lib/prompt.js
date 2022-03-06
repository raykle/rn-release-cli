const inquirer = require('inquirer')
const chalk = require('chalk')

const Constants = require("../config/constants")

const taskPromptFormat = chalk.bold.magenta
const ReactNativeTaskPrompt = taskPromptFormat(Constants.ReactNativePromptStr)
const CodePushTaskPrompt = taskPromptFormat(Constants.CodePushPromptStr)
const BugsnagTaskPrompt = taskPromptFormat(Constants.BugsnagPromptStr)

const promptMessageStrFormat = chalk.reset.italic.keyword('orange')

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
            message: `Choose platform:`,
            prefix: taskPromptFormat('📱'),
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
            message: `${ReactNativeTaskPrompt} Confirm the entry file: (${entryFile})`,
            prefix: taskPromptFormat('📦'),
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
            message: `${ReactNativeTaskPrompt} Enter the entry file Name:`,
            prefix: taskPromptFormat('📦'),
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
            message: `${ReactNativeTaskPrompt} Reset cache?`,
            prefix: taskPromptFormat('📦'),
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
            message: `${CodePushTaskPrompt} Choose deployment name:`,
            prefix: taskPromptFormat('🚀'),
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
            message: `${CodePushTaskPrompt} Enter target binary version:`,
            prefix: taskPromptFormat('　'),
            validate: input => {
              if (input.length > 0) {
                return true;
              }
              return "Version can not be empty (Enter version like: 1.0 or 1.0-2.0)";
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
            message: `${CodePushTaskPrompt} Confirm description: ${promptMessageStrFormat(`"${desc}"`)}`,
            prefix: taskPromptFormat('　'),
            default: true
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
            message: `${BugsnagTaskPrompt} Confirm code bundle id: ${promptMessageStrFormat(`"${bundleId}"`)}`,
            prefix: taskPromptFormat('🐞'),
            default: true
          }
        ])
        .then(({ codeBundleIdConfirmed }) => {
          resolve(codeBundleIdConfirmed);
        });
    })
  }
}

module.exports = Prompt
