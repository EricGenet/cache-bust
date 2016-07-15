'use strict'

let glob = require('glob')
let args = require('minimist')(process.argv.slice(2))
let fs = require('fs')
let path = require('path')
let merge = require('deep-extend')

console.log(args)

let options = {
  baseDir: args.hasOwnProperty('baseDir')
    ? args.baseDir
    : __dirname
}

let files = args['_']
  .reduce((files, pattern) => files.concat(
    glob.sync(pattern).map((f) => path.relative(options.baseDir, f))
  ), [])

console.dir(files)

/**
 * - glob for files
 * - is cwd ? compose relative paths
 * - hash contents
 * - remove old files (optional)
 */

let cacheBust = {
}

module.exports = cacheBust
