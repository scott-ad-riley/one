const express = require('express')
const fs = require('fs')
const https = require('https')
const path = require('path')
const Primus = require('primus')
const Project = require('./project')

const directory = path.resolve(__dirname + '/../test_folder_to_watch')

const app = express()

app.use((req, res, next) => {
  console.log('Got request', req.path, req.method)
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  )
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')
  res.setHeader('Access-Control-Allow-Origin', '*')
  return next()
})

app.get('/viewer', (_, res) => {
  res.sendFile(path.resolve(__dirname + '/../dist/viewer.html'))
})
app.use(express.static(path.resolve('.')))

let options = {
  key: fs.readFileSync(__dirname + '/testing.key'),
  cert: fs.readFileSync(__dirname + '/testing.crt'),
}

const PORT = 8080
const webserver = https.createServer(options, app).listen(PORT, function() {
  console.log('Extension Boilerplate service running on https', PORT)
})

const primus = new Primus(webserver, {})

const fileState = new Project(directory, publishFileChange, publishFileDeletion)

primus.on('connection', _spark => {
  primus.write({ eventType: 'FULL_TREE', data: fileState.fullTree() })
})

function publishFileChange({ filepath, contents }) {
  primus.write({ filepath, contents, eventType: 'FILE_UPDATED' })
}

function publishFileDeletion({ filepath }) {
  primus.write({ filepath, eventType: 'FILE_DELETED' })
}
