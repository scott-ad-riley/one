const { promisify } = require('util')
const fs = require('fs')
const watch = require('node-watch')

const lStatAsync = promisify(fs.lstat)

const Project = function(directory, emitFileChange, emitFileDeletion) {
  const files = {}

  const update = function(filepath) {
    console.log(`got an update event for ${filepath}`)
    fs.readFile(filepath, 'utf8', function(err, contents) {
      files[filepath] = contents
      emitFileChange({ filepath, contents })
    })
  }

  const folderAdded = function(filepath) {
    console.log(`got a folderAdded event for ${filepath}`)
    walkDirectory(filepath, update, folderAdded)
  }

  const remove = function(filepath) {
    console.log(`got a delete event for ${filepath}`)
    delete files[filepath]
    emitFileDeletion(filepath)
  }

  const fullTree = function() {
    return files
  }

  folderAdded(directory)

  watch(directory, { recursive: true }, function(evt, name) {
    if (evt === 'update') update(name)
    if (evt === 'remove') remove(name)
  })

  return { update, remove, fullTree }
}

const walkDirectory = function(directory, onFile, onFolder) {
  console.log(`walking ${directory}`)
  fs.readdir(directory, function(err, directoryContents) {
    if (err) throw err
    if (directoryContents.length === 0) return

    const filepaths = directoryContents.map(name => directory + '/' + name)

    Promise.all(filepaths.map(fileType)).then(fileTypes => {
      const folders = filepaths.filter((_, idx) => fileTypes[idx].directory)
      const files = filepaths.filter((_, idx) => fileTypes[idx].file)

      files.forEach(onFile)
      folders.forEach(onFolder)
    })
  })
}

async function fileType(path) {
  const result = await lStatAsync(path)
  return {
    file: result.isFile(),
    directory: result.isDirectory(),
  }
}

module.exports = Project
