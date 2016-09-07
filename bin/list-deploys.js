#!/usr/bin/env node

'use strict'

const path = require('path')
const packageFilename = path.join(process.cwd(), 'package.json')
const pkg = require(packageFilename)
require('console.table')

const nowPipeline = require('..')

nowPipeline.deployments(pkg.name)
  .then(deploys => {
    if (deploys.length) {
      console.table(deploys)
    } else {
      console.log(`Zero deploys for ${pkg.name}`)
    }
  })
  .catch(err => {
    console.error(err)
    process.exit(-1)
  })
