'use strict'

require('console.table')
const R = require('ramda')
const path = require('path')
const fs = require('fs')
const is = require('check-more-types')
const la = require('lazy-ass')

const Now = require('now-client')

function nowApi () {
  const authToken = process.env.NOW_AUTH
  if (!authToken) {
    console.error('Cannot find NOW_AUTH token')
    process.exit(-1)
  }

  const now = Now(authToken)

  const api = {
    // lists current deploy optionally limited with given predicate
    deployments (filter) {
      filter = filter || R.T
      return now.getDeployments()
        .then(R.filter(filter))
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
      console.log('deploying files', filenames)
      la(is.strings(filenames), 'missing file names', filenames)
      la(is.not.empty(filenames), 'expected list of files', filenames)

      const isPackageJson = R.test(/package\.json$/)
      console.assert(R.any(isPackageJson)(filenames),
        'missing package.json file')

      // TODO make sure all files exist

      const sources = R.map(name => fs.readFileSync(name, 'utf8'))(filenames)
      const names = R.map(path.basename)(filenames)

      const params = R.zipObj(names, sources)
      // parsed JSON object
      params.package = JSON.parse(params['package.json'])
      // JSON text
      // params.package = params['package.json']
      delete params['package.json']
      console.log(params)

      return now.createDeployment(params)
        .then(r => {
          console.log(r)
          return r
        })
        .catch(r => {
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
