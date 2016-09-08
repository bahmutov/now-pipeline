#!/usr/bin/env node

'use strict'

require('console.table')

const nowPipeline = require('..')
const pkg = nowPipeline.getPackage()

nowPipeline.deployments(pkg.name)
  .then(deploys => {
    if (deploys.length) {
      deploys.forEach(d => {
        delete d.created
      })
      console.table(deploys)
    } else {
      console.log(`Zero deploys for ${pkg.name}`)
    }
  })
  .catch(err => {
    console.error(err)
    process.exit(-1)
  })
