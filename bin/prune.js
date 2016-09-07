#!/usr/bin/env node

'use strict'

const path = require('path')
const packageFilename = path.join(process.cwd(), 'package.json')
const pkg = require(packageFilename)
require('console.table')

const nowPipeline = require('..')

function nonAliasedDeploys (deploys, aliases) {
  const aliasedDeploys = aliases.map(alias => alias.deploymentId)
  return deploys.filter(deploy => {
    return !aliasedDeploys.includes(deploy.uid)
  })
}

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

  const needToPrune = nonAliasedDeploys(deploys, aliases)
  if (needToPrune.length) {
    console.table('Will prune deploys', needToPrune)
  } else {
    console.log('No deploys to prune')
  }

  return needToPrune.reduce((prev, deploy) => {
    return prev.then(() => {
      console.log(`removing deploy ${deploy.uid} ${deploy.url}`)
      return nowPipeline.remove(deploy.uid)
    })
  }, Promise.resolve())
}).catch(err => {
  console.error(err)
  process.exit(-1)
})
