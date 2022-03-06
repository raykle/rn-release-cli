/* eslint-disable prefer-destructuring */
const path = require('path')
const spawn = require('cross-spawn')
const chalk = require('chalk')
const mkdirp = require('mkdirp')
const fs = require('fs')
const ora = require('ora')

const join = path.join
const existsSync = fs.existsSync

const Constants = require("../config/constants");

const succeedPrompt = chalk.bold.green(Constants.ReactNativePromptStr)
const failPrompt = chalk.bold.red(Constants.ReactNativePromptStr)
const infoPrompt = chalk.redBright.cyan(Constants.ReactNativePromptStr)

function rnBundle(options) {
  return new Promise(async (resolve, reject) => {
    await checkBundleFolder(options)

    try {
      await rnBundleAsync(options)
      resolve()
    } catch (err) {
      process.exit(1)
    }
  })
}

function rnBundleAsync(options) {
  return new Promise((resolve, reject) => {
    const {
      platform,
      entryFile,
      bundlePath,
      bundleFileFolderName,
      sourceMapFileFolderName,
      bundleFileName,
      sourceMapFileName,
      resetCache,
    } = options

    const dest = join(process.cwd(), bundlePath)
    const bundleFolderPath = join(dest, bundleFileFolderName)
    const bundleFilePath = join(bundleFolderPath, bundleFileName)
    const sourceMapFilePath = join(dest, sourceMapFileFolderName, sourceMapFileName)

    const bundleArgs = [
      'react-native', 'bundle',
      '--platform', platform,
      '--dev', 'false',
      '--entry-file', entryFile,
      '--bundle-output', bundleFilePath,
      '--assets-dest', bundleFolderPath,
      '--sourcemap-output', sourceMapFilePath
    ]

    if (resetCache) {
      bundleArgs.push('--reset-cache')
    }

    console.log(`--------------------------------`);
    console.log(`${infoPrompt} args: `, bundleArgs)
    console.log(`--------------------------------`);

    const spinner = ora(`${Constants.RNReleaseCLI} ${Constants.ReactNativePromptStr} 打包中...`)
    spinner.start()

    // const { status, error } = spawn.sync(
    //   'react-native',
    //   bundleArgs,
    //   {
    //     stdio: 'inherit',
    //     detached: true,
    //   }
    // )
    const bundleProcess = spawn(
      'npx',
      bundleArgs,
      {
        // stdio: 'inherit',
        detached: true,
      }
    )

    bundleProcess.stdout.on('data', data => {
      spinner.clear()
      let message = `${data}`
      message = message.trim().replace('\n/g', '')
      if (message.length > 0) {
        console.log(chalk.dim(message))
      }
    })

    bundleProcess.stdout.on('error', err => {
      spinner.fail(`${failPrompt} [Error] ${chalk.bold.red(err.message)}`)
      process.exit(1)
    })

    bundleProcess.on('error', err => {
      spinner.fail(`${failPrompt} [Error] ${chalk.bold.red(err.message)}`)
      process.exit(1)
    })

    bundleProcess.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(`${succeedPrompt} 打包完成`);
        resolve()
      } else {
        spinner.fail(`${failPrompt} 打包失败：${chalk.red(code)}`);
        process.exit(1)
      }
    })

    process.on('SIGINT', () => {
      spinner.fail(`[SIGINT] ${bundleProcess.pid}`)
      if (!bundleProcess.killed) {
        // process.kill(-bundleProcess.pid)
        bundleProcess.kill()
      }
      process.exit(1)
    })
  })
}
function mkdir(dirPath) {
  return mkdirp(dirPath)
}

function removeDir(dir) {
  return new Promise(((resolve, reject) => {
    // 读取文件夹
    fs.stat(dir, (err, stat) => {
      if (err) {
        reject(err)
        return
      }
      if (stat.isDirectory()) {
        fs.readdir(dir, (err, files) => {
          const promiseArray = files.map(file => {
            const newPath = path.join(dir, file)
            return removeDir(newPath)
          })
          Promise.all(promiseArray)
            .then(() => {
              fs.rmdir(dir, resolve)
            })
            .catch(e => {
              reject(e)
            })
        })
      } else {
        fs.unlink(dir, resolve)
      }
    })
  }))
}

async function checkBundleFolder(options) {
  const {
    bundlePath,
    bundleFileFolderName,
    sourceMapFileFolderName,
  } = options

  const bundleFileFolderPath = join(bundlePath, bundleFileFolderName)
  const sourceMapFileFolderPath = join(bundlePath, sourceMapFileFolderName)

  try {
    if (existsSync(bundlePath)) {
      await removeDir(bundlePath)
    }

    await mkdir(bundleFileFolderPath)
    await mkdir(sourceMapFileFolderPath)
  } catch (err) {
    if (err) {
      console.log('err: ', err)
    }
  }
}

module.exports = rnBundle
