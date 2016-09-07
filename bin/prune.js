#!/usr/bin/env node

'use strict'

const path = require('path')
const packageFilename = path.join(process.cwd(), 'package.json')
const pkg = require(packageFilename)
require('console.table')

const nowPipeline = require('..')

Promise.all([
  nowPipeline.deployments(pkg.name),
  nowPipeline.aliases(pkg.name)
]).then(([deploys, aliases]) => {
  if (deploys.length) {
    console.table('Deploys', deploys)
  } else {
    console.log('No deploys')
  }

  if (aliases.length) {
    console.table('Aliases', aliases)
  } else {
    console.log('No aliases')
  }
}).catch(err => {
  console.error(err)
  process.exit(-1)
})
