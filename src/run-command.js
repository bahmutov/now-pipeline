'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const spawn = require('cross-spawn')

function runCommand (command, extraEnv) {
  if (is.string(command)) {
    command = command.split(' ')
  }
  la(is.array(command), 'expected command and args array', command)
  la(command.length > 0, 'missing command, needs at least something', command)
  la(is.object(extraEnv), 'expected env object', extraEnv)

  return new Promise(function (resolve, reject) {
    const customEnv = Object.assign({}, process.env, extraEnv)

    const spawnOptions = {
      env: customEnv,
      stdio: 'inherit'
    }
    const prog = command[0]
    const args = command.slice(1)
    console.log(`running "${prog}" with extra env keys`,
      Object.keys(extraEnv))

    const proc = spawn(prog, args, spawnOptions)

    proc.on('error', (err) => {
      console.error('prog error')
      console.error(err)
      reject(err)
    })

    proc.on('close', (code) => {
      // debug(`${prog} exit code ${code}`)
      if (code) {
        const msg = `${prog} exit code ${code}`
        console.error(msg)
        return reject(new Error(msg))
      }
      resolve()
    })
  })
}

module.exports = runCommand
