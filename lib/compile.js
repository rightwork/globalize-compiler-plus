var
  cldr = require('cldr-data'),
  fs = require('fs'),
  path = require("path"),
  globalizeCompiler = require('globalize-compiler');

function WebpackHelper(locales, formatterRoot) {
  this.webpackHelperFilename = "webpack-helper.js"

  function localeTemplate(locale) {
    return [
      "	  if (locale == '" + locale + "') {",
      "      require.ensure([], function(require) {",
      "        var Globalize = require('" + formatterRoot + "formatters-" + locale + "')",
      "		  	resolve(Globalize)",
      "      })",
      "    } ",
      "   else "
    ].join("\n")
  }

  this.fileContents = function() {
    var body = locales.map(function(locale) {
      return localeTemplate(locale)
    }).join("\n")
    //console.log(body)

    // take off the else on the right end
    //body = body.trim().slice(0, -4)
    //

    // there is a trailing 'else', and that's ok.  we need it to reject the
    // promise if the locale didn't match any of the available locales
    body += [
      "    {",
      "      reject('Could not find available locale for locale name:' + locale)",
      "    }"
    ].join("\n")

    return [
      "module.exports = function(locale){",
      "  var promise = new Promise(function(resolve, reject){",
      body,
      "  })",
      "  return promise",
      "}"
    ].join("\n")
  }
}

module.exports = {
  /**
   * Compile globlize data using the application js, a messages object, and a
   * config.  Falls back on 'root' key (locale) for locales that aren't
   * specified in messagesObj, but are still passed in to locales array.
   *
   * @param  {array} sources       array with sources for globalize-compiler to extract
   * @param  {jsonObj} messagesObj json messages object for globalize
   * @param  {array} locales       array of locales to output.  if empty, then
   *                               all locales are processed!
   * @param  {String} outputPath   path where formatters will be stored. for
   *                               helpers like WebpackHelper
   * @return {obj}                 a json object, where each key is a filename
   *                               to write to, and the contents of the file.
   *                               formatters are stored in the 'formatters'
   *                               key, and have a value of an object where each
   *                               key is the locale, and each value is the
   *                               contents of the formatters for that locale
   */
  compile: function(sources, messagesObj, locales, appRoot) {
    // globalize-compiler won't include a message if it's not explicitly
    // referenced in a .js via a specific format (i.e. Globalize.messageFormatter)
    // it's much preferred to use a shorthand notation to pull messages from
    // messages.json, say _.m('like').  In order to do that, we have to mock up
    // a file that references all messages in the messages.json so that they will
    // be included in the compiled output.
    var messageBuffer = []
    var messageLocales = Object.keys(messagesObj)
    var stringKeys = []
    messageLocales.map(function(key) {
      messageKeysForLocale = Object.keys(messagesObj[key])
      Array.prototype.push.apply(stringKeys, messageKeysForLocale)
    })
    stringKeys = stringKeys.sort().filter(function(item, pos, ary) {
      return !pos || item != ary[pos - 1];
    })
    stringKeys.map(function(key) {
      messageBuffer.push('Globalize.messageFormatter("' + key + '")')
    })
    messageBuffer = messageBuffer.join('\n')

    //console.log(sources)
    //console.log(messageBuffer)
    sources.push(messageBuffer)
    var extracts = sources.map(function(input) {
      return globalizeCompiler.extract(input);
    });

    // load all locales if locales list is not specified!
    if (!locales) {
      locales = cldr.availableLocales;
    }

    formattersObj = {}
    processedLocales = []

    // loop through locales and compile them into formatter js files
    for (var i = 0; i < locales.length; i++) {
      var locale = locales[i];
      // if locale is specified in prefs, but not in messages, then fallback on en
      // so that we can at least get the cldr data for that locale, even though
      // the messages will be in english
      if (!messagesObj.hasOwnProperty(locale)) {
        messagesObj[locale] = messagesObj.root
      }

      // some locales cause exceptions still, i.e. when using all locales, so
      // ignore the ones that crap out
      try {

        // compile using config/messages.json, current locale iterator, and all
        // compiled extracts above
        //console.log(locale)
        //console.log(messagesObj)
        //console.log(extracts)
        var bundle = globalizeCompiler.compileExtracts({
          defaultLocale: locale,
          messages: messagesObj,
          extracts: extracts
        });

        formattersObj[locale] = bundle
        if (locale != "root") {
          processedLocales.push(locale)
        }
      } catch (err) {
        console.log(err)
      }
    }

    var webpackHelper = new WebpackHelper(processedLocales, appRoot)
    filesObj = {
      formatters: formattersObj
    }
    filesObj[webpackHelper.webpackHelperFilename] = webpackHelper.fileContents()

    return filesObj

  }
}
