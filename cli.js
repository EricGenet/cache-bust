#!/usr/bin/env node
'use strict'

let args = require('minimist')(process.argv.slice(2))
let cacheBust = require('./index.js')

/**
 * Parse command line arguments, set defaults
 */
if (!args['referenced'] || !args['referencing']) {
  console.error('`referenced` and `referencing` options must be specified')
  process.exit(1)
}
let getOpt = (long, short, defaultValue) => {
  if (args.hasOwnProperty(long)) {
    return args[long]
  } else if (args.hasOwnProperty(short)) {
    return args[short]
  }
  return defaultValue
}

let options = {
  referenced: getOpt('referenced', 'r', ''),
  referencing: getOpt('referencing', 'R', ''),
  baseDir: getOpt('baseDir', 'b', process.cwd()),
  hexLength: getOpt('hexLength', 'l', 7),
  exclude: getOpt('exclude', 'e', [])
}

cacheBust(options)
