'use strict'

let glob = require('glob')
let args = require('minimist')(process.argv.slice(2))
let fs = require('fs')
let path = require('path')
let merge = require('deep-extend')
let crypto = require('crypto')

/**
 * Parse command line arguments, set defaults
 */
let options = {
  baseDirExisting: args.hasOwnProperty('baseDirExisting')
    ? args.baseDirExisting
    : __dirname,
  baseDirNew: args.hasOwnProperty('baseDirNew')
    ? args.baseDirNew
    : __dirname,
  hexLength: args.hasOwnProperty('hexLength')
    ? args.hexLength
    : 7
}
if (!args['referenced'] || !args['referencing']) {
  console.error('`referenced` and `referencing` options must be specified')
  process.exit(1)
}

/**
 * Allow multiple glob patterns, separated by commas or spaces
 */
let filesFn = (str) => str.split(/[, ]/)
  .reduce((files, pattern) => files.concat(
    glob.sync(pattern)), [])

/**
 * Generate an array to store each referenced file's absolute path, relative
 * path (from `baseDir`) and the MD5 hash
 */
let referenced = filesFn(args['referenced'])
  .map((f) => {
    return {
      abs: path.resolve(f),
      relativeExisting: path.relative(options.baseDirExisting, f),
      relativeNew: path.relative(options.baseDirNew, f),
      hash: crypto.createHash('md5').update(fs.readFileSync(path.resolve(f))).digest('hex')
    }
  })
  .filter((f) => fs.lstatSync(f.abs).isFile())

/**
 * move/rename (potentially) referenced files
 */
let newName = (p, hash) => {
  let ext = path.extname(p)
  let base = path.basename(p, ext)
  let hashPart = hash.substring(0, options.hexLength)
  return `${base}-${hashPart}${ext}`
}
for (let f of referenced) {
  fs.renameSync(f.abs, path.join(path.dirname(f.abs), newName(f.abs, f.hash)))
}

/**
 * Go over each file containing references to `referencedFiles` and perform the
 * replacements
 */
for (let f of filesFn(args['referencing'])) {
  // replace occurences
}

let cacheBust = {
}

module.exports = cacheBust
