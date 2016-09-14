'use strict'

let glob = require('glob')
let fs = require('fs')
let path = require('path')
let crypto = require('crypto')

/**
 * Allow multiple glob patterns, separated by spaces
 */
function filesFn (str, globOptions) {
  if (!str || str && str.length === 0) {
    return []
  }
  let ret = str.split(' ')
    .reduce((globbed, pattern) => globbed.concat(glob.sync(pattern, globOptions)), [])
  return ret
}

/**
 *
 */
function hash (absFilePath) {
  if (!fs.lstatSync(absFilePath).isFile()) {
    return ''
  }
  return crypto
    .createHash('md5')
    .update(fs.readFileSync(absFilePath))
    .digest('hex')
}

/**
 * Generate an array to store each referenced file's absolute path, relative
 * path (from `baseDir`) and the MD5 hash. Uses the `exclude` option
 */
function getReferencedFiles (options) {
  let referencedFiles = filesFn(options.referenced, {ignore: []})
    .map((f) => {
      const absPath = path.resolve(f)
      return {
        abs: absPath,
        relative: path.relative(options.baseDir, f),
        hash: hash(absPath)
      }
    })
    .filter((f) => fs.lstatSync(f.abs).isFile())
  return referencedFiles
}

/**
 * Generate the basename of the file `p` with the hash `hash`
 */
function newNameFn (p, hash, options) {
  let ext = path.extname(p)
  let base = path.basename(p, ext)
  let hashPart = hash.substring(0, options.hexLength)
  return `${base}-${hashPart}${ext}`
}

/**
 * Start the process
 */
function run (options) {
  let referencedFiles = getReferencedFiles(options)
  if (!referencedFiles.length) {
    console.log('No referenced files; exiting...')
    process.exit(1)
  }

  /**
   * Perform renamings, and update `referencedFiles` objects to contain the
   * relative path (to `options.baseDir`) to the new, hashed file
   */
  for (let f of referencedFiles) {
    let newName = newNameFn(f.abs, f.hash, options)
    let newFullPath = path.join(path.dirname(f.abs), newName)
    fs.renameSync(f.abs, newFullPath)
    f.hashedRelative = path.join(path.dirname(f.relative), newName)
  }

  /**
   * Go over each file containing references to `referencedFiles` and perform the
   * replacements
   */
  for (let fileName of filesFn(options['referencing'], {})) {
    let fileContents = fs.readFileSync(fileName, {encoding: 'utf8'})
    for (let referenced of referencedFiles) {
      fileContents = fileContents
        .split(referenced.relative)
        .join(referenced.hashedRelative)
    }
    fs.writeFileSync(fileName, fileContents)
  }
}

module.exports = run
