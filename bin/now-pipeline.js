#!/usr/bin/env node

'use strict'

const R = require('ramda')
const runCommand = require('../src/run-command')

const args = process.argv.slice(2)
console.log('arguments', args)

const envUrlName = 'NOW_URL'

var start

if (process.env[envUrlName]) {
  const url = process.env[envUrlName]
  console.log(`found existing env variable ${envUrlName} ${url}`)
  start = Promise.resolve(url)
} else {
  const nowPipeline = require('..')
  start = nowPipeline.deploy(args).then(r => {
    console.log('deployed to url', r.host)
    return `https://${r.host}`
  })
}

start
  .then(url => {
    console.log('testing url %s', url)
    const env = {}
    env[envUrlName] = url
    return runCommand(['npm', 'test'], env).then(R.always(url))
  })
  .then((url) => {
    console.log(`deployed url ${url} is working`)
  })
  .catch(err => {
    console.error(err)
    process.exit(-1)
  })
// TODO switch alias to new URL
// TODO take down previous deployment
