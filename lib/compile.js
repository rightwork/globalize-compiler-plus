var
  cldr = require('cldr-data'),
  fs = require('fs'),
  globalizeCompiler = require('globalize-compiler');

  module.exports = {
    /**
     * Compile globlize data using the application js, a messages object, and a
     * config.  Falls back on 'root' key (locale) for locales that aren't
     * specified in messagesObj, but are still passed in to locales array.
     *
     * @param  {string} jsBuffer     string with js for globalize-compiler to extract
     * @param  {jsonObj} messagesObj json messages object for globalize
     * @param  {array} locales       array of locales to output.  if empty, then
     *                               all locales are processed!
     * @return {jsonObj}             a json object, where each key is the locale
     *                               and the value is the compiled js bundle from
     *                               the input
     *
     */
    compile: function(jsBuffer, messagesObj, locales) {
      // TODO: globalize-compiler won't include a message if it's not explicitly
      // referenced in a .js via a specific format (i.e. Globalize.messageFormatter)
      // it's much preferred to use a shorthand notation to pull messages from
      // messages.json, say _.m('like').  In order to do that, we have to mock up
      // a file that references all messages in the messages.json so that they will
      // be included in the compiled output.
      // START HACK:
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
      // END HACK:

      var extracts = [jsBuffer, messageBuffer].map(function(input) {
        return globalizeCompiler.extract(input);
      });

      // load all locales if locales list is not specified!
      if (!locales){
        locales = cldr.availableLocales;
      }

      formattersObj = {}

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
          var bundle = globalizeCompiler.compileExtracts({
            defaultLocale: locale,
            messages: messagesObj,
            extracts: extracts
          });

          formattersObj[locale] = bundle
        } catch (err) {
          console.log(err)
        }
      }

      return formattersObj

    }
  }
