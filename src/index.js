'use strict'

require('console.table')
const axios = require('axios')
const R = require('ramda')

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
    deployments (filter) {
      filter = filter || R.T
      return rest.get('/deployments')
        .then(R.prop('data'))
        .then(R.prop('deployments'))
        .then(R.filter(filter))
    }
  }
  return api
}

const now = nowApi()

function allDeploysFor (name) {
  return now.deployments(R.propEq('name', name))
}
allDeploysFor('feathers-chat-app-gleb')
  .then(console.table).catch(console.error)

  // now.deployments().then(console.table).catch(console.error)
