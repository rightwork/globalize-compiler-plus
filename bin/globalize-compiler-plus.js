"use strict";

var fs = require( "fs" );
var GlobalizeCompilerPlus = require( "../index" ).compile;
var nopt = require( "nopt" );
var path = require( "path" );
var pkg = require( "../package.json" );
var mkdirp = require('mkdirp');

function help() {
  var out = [
    "Usage: globalize-compiler-plus [-l LOCALES] -m MESSAGES_FILE -o DEST_DIR SRC_FILES",
    "Example: globalize-compiler-plus -l en,fr,es,de -m test/messages.json -o test/output/ test/*.js",
    "",
    " Default Locales used are those provided in messages.json file",
    "",
    "General options:",
    "  -h, --help                     # Print options and usage.",
    "  -v, --version                  # Print the version number.",
    "  -l, --locales                  # Optional.  Comma separated list of specific locale(s) to override those in messages.json",
    "  -m, --messages MESSAGES_FILE   # Translation messages for internal locales (JSON format).",
    "  -o, --output DEST_DIR          # Outputs files of the form formatters-<locale>.js",
    ""
  ];

  return out.join( "\n" );
}

var opts = nopt( {
  help: Boolean,
  version: Boolean,
  locales: String,
  messages: path,
  output: path
}, {
  h: "--help",
  v: "--version",
  l: "--locales",
  m: "--messages",
  o: "--output"
});
var requiredOpts = true;

if ( opts.version ) {
  return console.log( pkg.version );
}

if ( !opts.messages || !opts.output ) {
  requiredOpts = false;
}

var extraOptions = Object.keys( opts ).filter(function( option ) {
  return !/help|version|locale|cldr|messages|output|argv/.test( option );
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

if(input.length > 1){
  return console.log( "For now, only one source input argument is allowed (i.e. *.js, or file.js)")
}

var messages = messages ? JSON.parse( fs.readFileSync( messages ) ) : null;

// preferred to get locales from those defined in messages file
if(!opts.locales){
  locales = Object.keys(messages)
} else {
  var locales = opts.locales.split(',');
}

var bundleObj = GlobalizeCompilerPlus(input, messages, locales)

mkdirp(output)

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
