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

app.get('/viewer.html', (_, res) => {
  res.sendFile(path.resolve(__dirname + '/../dist/viewer.html'))
})
app.get('/config.html', (_, res) => {
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
  const files = fileState.fullTree()
  primus.write({
    eventType: 'FULL_TREE',
    data: Object.keys(files).map(filepath => {
      return { filepath, contents: files[filepath] }
    }),
  })
})

function publishFileChange({ filepath, contents }) {
  primus.write({ data: { filepath, contents }, eventType: 'FILE_UPDATED' })
}

function publishFileDeletion({ filepath }) {
  primus.write({ data: { filepath }, eventType: 'FILE_DELETED' })
}
