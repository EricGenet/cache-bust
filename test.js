'use strict'

let mock = require('mock-fs')
let assert = require('assert')
let fs = require('fs')

let cacheBust = require('./index.js')

// a file is hashed with MD5, and the occurences in another file are replaced
mock({
  'index.html': '<img src="img/foo.png">',
  'img': {
    'foo.png': 'FAKE_PNG_DATA'
  }
})

cacheBust.bust({
  assets: 'img/*',
  files: '**/*.html'
})

assert(fs.existSync('img/foo-ac3e140.png'))
assert(fs.readFileSync('index.html') === '<img src="img/foo-ac3e140.png">')

// check old assets were removed

// check replacements

// cwd - composing relative paths
