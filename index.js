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
  baseDir: args.hasOwnProperty('baseDir')
    ? args.baseDir
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
let referencedFiles = filesFn(args['referenced'])
  .map((f) => {
    return {
      abs: path.resolve(f),
      relative: path.relative(options.baseDir, f),
      hash: crypto.createHash('md5').update(fs.readFileSync(path.resolve(f))).digest('hex')
    }
  })
  .filter((f) => fs.lstatSync(f.abs).isFile())

console.log(referencedFiles)

/**
 * For each referenced file, rename it by appending a part of the hash after
 * the basename, and store the new file name as `hashedRelative`
 */
let newNameFn = (p, hash) => {
  let ext = path.extname(p)
  let base = path.basename(p, ext)
  let hashPart = hash.substring(0, options.hexLength)
  return `${base}-${hashPart}${ext}`
}
for (let f of referencedFiles) {
  let newName = newNameFn(f.abs, f.hash)
  let newFullPath = path.join(path.dirname(f.abs), newName)
  fs.renameSync(f.abs, newFullPath)
  f.hashedRelative = path.join(path.dirname(f.relative), newName)
}

/**
 * Go over each file containing references to `referencedFiles` and perform the
 * replacements
 */
for (let fileName of filesFn(args['referencing'])) {
  let fileContents = fs.readFileSync(fileName, {encoding: 'utf8'})
  for (let referenced of referencedFiles) {
    let newFileContents = fileContents
      .split(referenced.relative)
      .join(referenced.hashedRelative)
    fs.writeFileSync(fileName, newFileContents)
  }
}

let cacheBust = {
}

module.exports = cacheBust
