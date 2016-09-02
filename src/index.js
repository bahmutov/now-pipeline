'use strict'

require('console.table')
const axios = require('axios')
const R = require('ramda')
const path = require('path')

function httpClient (token) {
  const client = axios.create({
    baseURL: 'https://api.zeit.co/now',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  return client
}

function nowApi () {
  const authToken = process.env.NOW_AUTH
  if (!authToken) {
    console.error('Cannot find NOW_AUTH token')
    process.exit(-1)
  }

  const rest = httpClient(authToken)

  const api = {
    // lists current deploy optionally limited with given predicate
    deployments (filter) {
      filter = filter || R.T
      return rest.get('/deployments')
        .then(R.prop('data'))
        .then(R.prop('deployments'))
        .then(R.filter(filter))
    },
    // TODO deploys new code
    deploy (filenames) {
      // TODO make sure there is 'package.json'
      console.log('deploying files', filenames)

      const isPackageJson = R.test(/package\.json$/)

      const [[packageFile], otherFiles] = R.partition(isPackageJson, filenames)

      // const packageFile = R.find(isPackageJson)(filenames)
      // console.log(packageFile)

      const names = R.map(path.basename)(otherFiles)
      // console.log('names', names)

      const params = R.zipObj(names, otherFiles)
      params.package = packageFile
      console.log(params)

      // const url = 'foo'
      // return Promise.resolve(url)
      return rest.post('/deployments', {
        body: JSON.stringify(params)
      }).then(r => data)
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

function deployTest () {
  const relative = require('path').join.bind(null, __dirname)
  const files = [
    relative('test/package.json'),
    relative('test/index.js')
  ]
  return now.deploy(files)
}
deployTest()
  .then(console.table)
  .catch(console.error)
