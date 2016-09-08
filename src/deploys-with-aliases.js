'use strict'

const is = require('check-more-types')
const la = require('lazy-ass')
const debug = require('debug')('now-pipeline')

function combineDeploysAndAliases ({deploys, aliases}) {
  la(is.array(deploys), 'list of deploys missing', deploys)
  la(is.array(aliases), 'list of aliases missing', aliases)

  debug('matching %d deploys with %d aliases', deploys.length, aliases.length)

  return deploys.map(deploy => {
    const alias = aliases.find(a => a.deploymentId === deploy.uid)
    if (alias) {
      deploy.alias = alias.alias
      deploy.aliasId = alias.uid
      debug('deploy %s matched alias %s', deploy.url, deploy.alias)
    }
    return deploy
  })
}

module.exports = combineDeploysAndAliases
