'use strict'

require('console.table')
const axios = require('axios')
const R = require('ramda')
const path = require('path')
const fs = require('fs')

const Now = require('now-client')

// function httpClient (token) {
//   const client = axios.create({
//     baseURL: 'https://api.zeit.co/now',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`
//     }
//   })
//   return client
// }

function nowApi () {
  const authToken = process.env.NOW_AUTH
  if (!authToken) {
    console.error('Cannot find NOW_AUTH token')
    process.exit(-1)
  }

  // const rest = httpClient(authToken)

  const now = Now(authToken)

  const api = {
    // lists current deploy optionally limited with given predicate
    deployments (filter) {
      filter = filter || R.T
      // return rest.get('/deployments')
      return now.getDeployments()
        // .then(R.prop('data'))
        // .then(R.prop('deployments'))
        // .then(R.filter(filter))
    },
    // TODO deploys new code
    deploy (filenames) {
      console.log('deploying files', filenames)

      const isPackageJson = R.test(/package\.json$/)
      console.assert(R.any(isPackageJson)(filenames),
        'missing package.json file')

      const sources = R.map(name => fs.readFileSync(name, 'utf8'))(filenames)
      const names = R.map(path.basename)(filenames)

      const params = R.zipObj(names, sources)
      // parsed JSON object
      params.package = JSON.parse(params['package.json'])
      // JSON text
      // params.package = params['package.json']
      delete params['package.json']
      console.log(params)

      // const url = 'foo'
      // return Promise.resolve(url)
      // return rest.post('/deployments', {
      //   data: params
      // }).then(r => r.data)
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

//
// examples
//
function showDeploysForProject () { // eslint-disable-line no-unused-vars
  const name = 'feathers-chat-app-gleb'
  now.deployments(R.propEq('name', name))
    .then(console.table).catch(console.error)
}

function showAllDeploys () { // eslint-disable-line no-unused-vars
  now.deployments().then(console.table).catch(console.error)
}

function deployTest () { // eslint-disable-line no-unused-vars
  const relative = require('path').join.bind(null, __dirname)
  const files = [
    relative('../test/package.json'),
    relative('../test/index.js')
  ]
  return now.deploy(files)
}

showAllDeploys()

// deployTest()
//   .then(console.table)
//   .catch(console.error)
