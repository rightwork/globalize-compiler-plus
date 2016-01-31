"use strict";

var fs = require( "fs" );
var GlobalizeCompilerPlus = require( "../index" ).compile;
var nopt = require( "nopt" );
var path = require( "path" );
var pkg = require( "../package.json" );
var mkdirp = require('mkdirp');

function help() {
  var out = [
    "Usage: globalize-compiler-plus [-l LOCALES] -m MESSAGES_FILE -o DEST_DIR -a APP_ROOT SRC_FILES",
    "Example: globalize-compiler-plus -l en,fr,es,de -m test/messages.json -a output/-o test/output/ test/*.js",
    "",
    " Default Locales used are those provided in messages.json file",
    "",
    "General options:",
    "  -h, --help                     # Print options and usage.",
    "  -v, --version                  # Print the version number.",
    "  -l, --locales                  # Optional.  Comma separated list of specific locale(s) to override those in messages.json",
    "  -m, --messages MESSAGES_FILE   # Translation messages for internal locales (JSON format).",
    "  -o, --output DEST_DIR          # Outputs files of the form formatters-<locale>.js",
    "  -a, --approot PATH             # For web helpers, the runtime, client side path to the directories the formatters will live.  See webpack-helper.js output for more",
    ""
  ];

  return out.join( "\n" );
}

var opts = nopt( {
  help: Boolean,
  version: Boolean,
  locales: String,
  messages: path,
  output: path,
  approot : String
}, {
  h: "--help",
  v: "--version",
  l: "--locales",
  m: "--messages",
  o: "--output",
  a: "--approot"
});
var requiredOpts = true;

if ( opts.version ) {
  return console.log( pkg.version );
}

if ( !opts.approot || !opts.messages || !opts.output ) {
  requiredOpts = false;
}

var extraOptions = Object.keys( opts ).filter(function( option ) {
  return !/help|version|locale|approot|cldr|messages|output|argv/.test( option );
});

if ( extraOptions.length ) {
  console.log( "Invalid options:", extraOptions.join( ", " ), "\n" );
}

if ( opts.help || !requiredOpts || extraOptions.length ) {
  return console.log( help() );
}

var input = opts.argv.remain;
var messages = opts.messages;
var output = opts.output;
var approot = opts.approot

var messages = messages ? JSON.parse( fs.readFileSync( messages ) ) : null;

// preferred to get locales from those defined in messages file
if(!opts.locales){
  locales = Object.keys(messages)
} else {
  var locales = opts.locales.split(',');
}

var filesObj = GlobalizeCompilerPlus(input, messages, locales, approot)
var bundleObj = filesObj.formatters

mkdirp(output)

// write helpers
var filenames = Object.keys(filesObj)
for (var f in filenames){
  var filename = filenames[f]
  if(filename == "formatters"){
    continue
  }
  var filepath = path.join(output, filename)
  fs.writeFileSync(filepath, filesObj[filename])
}

locales = Object.keys(bundleObj)
for (var i in locales){
  var locale = locales[i]
  if(locale == "root"){
    continue
  }
  var filename = path.join(output, "formatters-" + locale + ".js")
  var bundle = bundleObj[locale]
  fs.writeFileSync(filename, bundle);
}
