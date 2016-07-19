'use strict'

let fsMock = require('mock-fs')
let assert = require('assert')
let fs = require('fs')
let merge = require('deep-extend')

let cacheBust = require('./index.js')

let testFileStructure = {
  'img': {
    'foo.png': 'FAKE_PNG_DATA'
  },
  'index.html': '<img src="img/foo.png">'
}

let testOptions = {
  baseDir: __dirname,
  referenced: 'img/*.png',
  referencing: '*.html',
  exclude: [],
  hexLength: 7
}

// basic
fsMock(testFileStructure)

cacheBust(testOptions)

assert(fs.existsSync('img/foo-ac3e140.png'))
assert(fs.readFileSync('index.html', 'utf8') === '<img src="img/foo-ac3e140.png">')

fsMock.restore()

// ignore/exclude
fsMock(merge({}, testFileStructure, {
  'img': {
    'bar.jpg': 'FAKE_JPG_DATA'
  }
}))

cacheBust(merge({}, testOptions, {
  exclude: ['img/*.jpg']
}))

assert(fs.existsSync('img/foo-ac3e140.png'))
assert(fs.readFileSync('index.html', 'utf8') === '<img src="img/foo-ac3e140.png">')

fsMock.restore()

// multiple files
fsMock(merge({}, testFileStructure, {
  'img': {
    'bar.jpg': 'FAKE_JPG_DATA' // 4a90024c4cbc7a9447fb3652852bc832
  },
  'index.html': '<img src="img/foo.png"><img src="img/bar.jpg">'
}))
cacheBust(merge({}, testOptions, {
  referenced: 'img/*.{png,jpg}'
}))
assert(fs.existsSync('img/foo-ac3e140.png'))
assert(fs.existsSync('img/bar-4a90024.jpg'))
assert(fs.readFileSync('index.html', 'utf8') === '<img src="img/foo-ac3e140.png"><img src="img/bar-4a90024.jpg">')
