/* eslint-disable prefer-destructuring */
const path = require('path')
const spawn = require('cross-spawn')
const chalk = require('chalk')
const mkdirp = require('mkdirp')
const fs = require('fs')
const ora = require('ora')

const join = path.join
// const basename = path.basename

const existsSync = fs.existsSync

const codePushFolderName = 'bundle'
const sourceMapFolderName = 'sourcemap'
const RNReleaseCLI = chalk.bold.cyan('RN Release CLI')

async function bundle(options) {
  return new Promise(async (resolve, reject) => {
    const {
      bundlePath,
    } = options
  
    // const dest = join(process.cwd(), bundlePath)
    await checkBundleFolderExists(bundlePath)
  
    try {
      await rnBundleAsync(options)
      resolve()
    } catch (err) {
      process.exit(1)
    }

    // process.exit(0)
  })
}

function rnBundleAsync(options) {
  return new Promise((resolve, reject) => {
    const {
      platform,
      entryFile,
      bundlePath,
      bundleFileName,
      sourceMapFileName,
      resetCache,
    } = options

    const dest = join(process.cwd(), bundlePath)
    const bundleFolderPath = join(dest, codePushFolderName)
    const bundleFilePath = join(bundleFolderPath, bundleFileName)
    const sourceMapFilePath = join(dest, sourceMapFolderName, sourceMapFileName)

    console.log(`----------------\n`)
    const spinner = ora(`${RNReleaseCLI} 打包中...`)
    spinner.start()

    const spawnArgs = ['bundle',
      '--platform', platform,
      '--dev', 'false',
      '--entry-file', entryFile,
      '--bundle-output', bundleFilePath,
      '--assets-dest', bundleFolderPath,
      '--sourcemap-output', sourceMapFilePath
    ]

    if (resetCache) {
      spawnArgs.push('--reset-cache')
    }

    // const { status, error } = spawn.sync(
    //   'react-native',
    //   spawnArgs,
    //   {
    //     stdio: 'inherit',
    //     detached: true,
    //   }
    // )
    const bundleProcess = spawn(
      'react-native',
      spawnArgs,
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
        console.log(message)
      }
    })

    bundleProcess.stdout.on('error', err => {
      spinner.fail(`[Error] ${chalk.bold.red(err.message)}`)
      process.exit(1)
    })

    bundleProcess.on('error', err => {
      spinner.fail(`[Error] ${chalk.bold.red(err.message)}`)
      process.exit(1)
    })

    bundleProcess.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(`${RNReleaseCLI} 打包完成`)
        resolve()
      } else {
        spinner.fail(`${RNReleaseCLI} 打包失败：${chalk.red(code)}`)
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

async function checkBundleFolderExists(folderPath) {
  if (!existsSync(folderPath)) {
    try {
      const bundlePath = join(folderPath, codePushFolderName)
      const sourcePapPath = join(folderPath, sourceMapFolderName)
      await mkdir(bundlePath)
      await mkdir(sourcePapPath)
    } catch (err) {
      if (err) {
        console.log('err: ', err)
      }
    }
  } else {
    try {
      await removeDir(folderPath)
      await checkBundleFolderExists(folderPath)
    } catch (err) {
      console.log('err: ', err)
    }
  }
}

module.exports = bundle
