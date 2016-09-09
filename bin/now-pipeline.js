#!/usr/bin/env node

'use strict'

const debug = require('debug')('now-pipeline')
const initCrashReporter = require('node-sentry-error-reporter')
initCrashReporter()

const R = require('ramda')
const runCommand = require('../src/run-command')
const is = require('check-more-types')
const la = require('lazy-ass')
const pkgd = require('pkgd')
const argv = require('minimist')(process.argv.slice(2))

const envUrlName = 'NOW_URL'
const passAsName = argv.as || envUrlName
const testCommand = argv.test || 'npm test'

const nowPipeline = require('..')
const pkg = nowPipeline.getPackage()

function findFiles () {
  return pkgd(process.cwd())
    .then(R.prop('files'))
}

var start

function findDeploy (url) {
  la(is.url(url), 'expected url', url)

  return nowPipeline.deployments()
    .then(deploys => {
      debug('looking for url %s in %d deploys', url, deploys.length)

      const found = deploys.find(d => {
        return url.endsWith(d.url)
      })
      if (!found) {
        console.error('Could not find deploy for url', url)
        process.exit(-1)
      }
      debug('found deployment', found)
      return found
    })
}

if (process.env[envUrlName]) {
  const url = process.env[envUrlName]
  console.log(`found existing env variable ${envUrlName} ${url}`)

  // start = Promise.resolve(url)
  // todo Find the deployment with given url
  start = findFiles().then((filenames) => findDeploy(url))
} else {
  start = findFiles().then(nowPipeline.deploy)
}

function setFullHost (deploy) {
  if (!deploy.url) {
    deploy.url = deploy.host
  }
  deploy.url = addHttps(deploy.url)

  console.log('deployed to url', deploy.url)
  la(is.url(deploy.url), 'expected deploy.url to be full https', deploy.url)
  return deploy
}

function deployIsWorking (deploy) {
  console.log(`deployed url ${deploy.url} is working`)
}

function addHttps (url) {
  return url.startsWith('https://') ? url : 'https://' + url
}

const updateAliasIfNecessary = R.curry(
  function updateAliasIfNecessary (aliasName, deploy) {
    la(is.maybe.string(aliasName), 'alias name should be a string', aliasName)

    return nowPipeline.deployments(pkg.name)
    .then(deploys => {
      return R.filter(R.prop('alias'))(deploys)
    })
    .then(deployed => {
      console.log('found %d deploy(s) with aliases', deployed.length)
      debug(deployed)

      if (!deployed.length) {
        console.log('there is no existing alias')
        if (!aliasName) {
          console.log('will skip updating alias to', deploy.url)
          return
        }
        console.log('setting new alias to %s', aliasName)
        return nowPipeline.now.createAlias(deploy.uid, aliasName)
          .catch(err => {
            console.error('Could not create alias')
            console.error(err.message)
            console.error('Note: you need to create a FIRST alias to domain MANUALLY')
            console.error('using a command like this:')
            console.error(`  now alias ${deployed.url} ${aliasName}`)
            return Promise.reject(err)
          })
      }

      if (deployed.length > 1) {
        console.log('found %d deployed aliases', deployed.length)
        console.log('not sure which one to update')
        return Promise.reject(new Error('Multiple aliases'))
      }

      la(deployed.length === 1, 'expect single alias')

      const alias = deployed[0]
      if (alias.uid === deploy.uid) {
        console.log('The current alias %s points at the same deploy %s',
          alias.alias, deploy.url)
        console.log('Nothing to do')
        return
      }

      console.log('switching alias %s to point at new deploy %s',
        alias.alias, deploy.url)
      la(is.unemptyString(alias.alias), 'invalid alias', alias)

      return nowPipeline.now.createAlias(deploy.uid, alias.alias)
        .then(result => {
          debug('createAlias result', result)
          console.log('switched alias %s to point at %s',
            alias.alias, deploy.url)
          console.log('taking down previously aliased deploy',
            alias.uid)
          return nowPipeline.remove(alias.uid)
        })
    })
  })

function testDeploy (deploy) {
  la(is.object(deploy), 'wrong deploy object', deploy)
  console.log('testing url %s', deploy.url)
  console.log('passing it as env variable %s', passAsName)
  console.log('test command "%s"', testCommand)
  la(is.url(deploy.url), 'missing deploy url in', deploy)

  const env = {}
  env[passAsName] = deploy.url
  return runCommand(testCommand, env)
    .then(R.always(deploy))
}

start
  .then(setFullHost)
  .then(testDeploy)
  .then(R.tap(deployIsWorking))
  .then(updateAliasIfNecessary(argv.alias))
  .catch(err => {
    console.error('Something went wrong')
    console.error('Sometimes restarting pipeline can help')
    console.error(err)
    process.exit(-1)
  })
