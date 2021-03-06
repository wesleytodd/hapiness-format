var path = require('path')
var deglob = require('deglob')
var fs = require('fs')
var formatter = require('esformatter')

var ESFORMATTER_CONFIG = require(path.join(__dirname, 'rc', 'esformatter.json'))
var DEFAULT_IGNORE = [
  'node_modules/**',
  '.git/**',
  '**/*.min.js',
  '**/bundle.js'
]

var MULTI_NEWLINE_N = /((?:\n){3,})/g
var MULTI_NEWLINE_RN = /((?:\r\n){3,})/g

var SOF_NEWLINES = /^(\r?\n)+/g

module.exports.transform = function (file) {
  file = file
    .replace(MULTI_NEWLINE_N, '\n\n')
    .replace(MULTI_NEWLINE_RN, '\r\n\r\n')

  var formatted = formatter.format(file, ESFORMATTER_CONFIG)
    .replace(SOF_NEWLINES, '')

  return formatted
}

module.exports.load = function (opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) opts = {}

  var ignore = [].concat(DEFAULT_IGNORE) // globs to ignore
  if (opts.ignore) ignore = ignore.concat(opts.ignore)

  var deglobOpts = {
    ignore: ignore,
    cwd: opts.cwd || process.cwd(),
    useGitIgnore: true,
    usePackageJson: true,
    configKey: 'standard'
  }

  deglob(['**/*.js', '**/*.jsx'], deglobOpts, function (err, files) {
    if (err) return cb(err)

    files = files.map(function (f) {
      return { name: f, data: fs.readFileSync(f).toString() } // assume utf8
    })
    cb(null, files)
  })
}
