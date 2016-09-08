'use strict'

require('console.table')

const debug = require('debug')('now-pipeline')
const R = require('ramda')
const path = require('path')
const fs = require('fs')
const is = require('check-more-types')
const la = require('lazy-ass')
const Now = require('now-client')

function nowApi () {
  const authToken = process.env.NOW_TOKEN
  if (!authToken) {
    console.log('ERROR: Cannot find NOW_TOKEN environment variable')
    process.exit(-1)
  }

  const now = Now(authToken)

  function wait (seconds) {
    console.log(`waiting ${seconds} seconds`)
    return new Promise((resolve, reject) => {
      setTimeout(resolve)
    }, seconds * 1000)
  }

  function checkDeploy (id) {
    la(is.unemptyString(id), 'expected deploy id', id)
    return now.getDeployment(id)
  }

  function waitUntilDeploymentReady (id) {
    return checkDeploy(id)
      .then(r => {
        console.log(r)
        if (r.state === 'READY') {
          return r
        }
        if (r.state === 'DEPLOYING' || r.state === 'BOOTED') {
          return wait(5).then(() => waitUntilDeploymentReady(id))
        }
        throw new Error('Something went wrong with the deploy\n' + JSON.stringify(r))
      })
  }

  const api = {
    now, // expose the actual now client
    // lists current deploy optionally limited with given predicate
    deployments (filter) {
      if (is.string(filter)) {
        filter = R.propEq('name', filter)
      }
      filter = filter || R.T
      return now.getDeployments()
        .then(R.filter(filter))
    },
    aliases () {
      return now.getAliases()
    },
    remove (id) {
      la(is.unemptyString(id), 'expected deployment id', id)
      debug('deleting deployment %s', id)
      return now.deleteDeployment(id)
    },
    /**
      deploys given filenames. Returns object with result
      {
        uid: 'unique id',
        host: 'now-pipeline-test-lqsibottrb.now.sh',
        state: 'READY'
      }
    */
    deploy (filenames) {
      debug('deploying %d files', filenames.length)
      debug(filenames)

      la(is.strings(filenames), 'missing file names', filenames)
      la(is.not.empty(filenames), 'expected list of files', filenames)

      const isPackageJson = R.test(/package\.json$/)
      console.assert(R.any(isPackageJson)(filenames),
        'missing package.json file')

      const packageJsonFilename = filenames.find(isPackageJson)
      const packageJsonFolder = path.dirname(packageJsonFilename)
      debug('package.json filename is', packageJsonFilename)
      debug('in folder', packageJsonFolder)

      // TODO make sure all files exist

      const sources = R.map(name => fs.readFileSync(name, 'utf8'))(filenames)
      const names = R.map(filename => {
        return path.relative(packageJsonFolder, filename)
      })(filenames)
      debug('sending files', names)

      const params = R.zipObj(names, sources)
      // parsed JSON object
      params.package = JSON.parse(params['package.json'])
      delete params['package.json']

      // we do not need dev dependencies in the deployed server
      delete params.package.devDependencies

      return now.createDeployment(params)
        .then(r => {
          return waitUntilDeploymentReady(r.uid)
        })
        .catch(r => {
          if (is.error(r)) {
            return Promise.reject(r)
          }
          console.error('error')
          console.error(r.response.data)
          return Promise.reject(new Error(r.response.data.err.message))
        })
    }
  }
  return api
}

const now = nowApi()

module.exports = now

//
// examples
//
// function showDeploysForProject () { // eslint-disable-line no-unused-vars
//   const name = 'now-pipeline-test'
//   now.deployments(R.propEq('name', name))
//     .then(console.table).catch(console.error)
// }

// function showAllDeploys () { // eslint-disable-line no-unused-vars
//   now.deployments().then(console.table).catch(console.error)
// }

// function deployTest () { // eslint-disable-line no-unused-vars
//   const relative = require('path').join.bind(null, __dirname)
//   const files = [
//     relative('../test/package.json'),
//     relative('../test/index.js')
//   ]
//   return now.deploy(files)
// }

// showAllDeploys()
// showDeploysForProject()

// deployTest()
//   .then(result => {
//     console.log('deployment done with result', result)
//   })
//   .catch(console.error)
