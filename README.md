#Background#

Globalize is great and has some good build tool support. In my case I'm using webpack. There is an npm module for that. Great!  Unfortunately for me, though, ...

* There is some narly stuff going on in [this example](https://github.com/jquery/globalize/blob/master/examples/app-npm-webpack/index-template.html) at the bottom of the html file to get webpack plus globalize working optimally in production
* The example also unfortunately works for just one locale, and its unclear to me, being new to the js world, what I would need to do to get that to work
* But, **mainly**, it's because it is unusable for my case.  Partly documented [here](https://github.com/rxaviers/globalize-webpack-plugin/issues/6), you must statically reference every key (that you'd like bundled) in your message json file using Globalize.messageFormatter(key). Not only is it verbose, but it doesn't allow for using keys  dynamically. This seems to be intentional design for [globalize-compiler](https://github.com/jquery-support/globalize-compiler) and [globalize-webpack-plugin](https://github.com/rxaviers/globalize-webpack-plugin).  That's fair, but I wanted a solution that allows me to use my own shorthand format ( i.e \_(key) ) and bundles every key/value in the messages json regardless of whether it's referenced in the code.

This solution aims to simplify and close the gap on the above issues.  I chose to build from globalize-compiler for a few reasons:
* It's 95% there
* CLI and simple function calls easier to reason about vs webpack and globalize internals. Something like [KISS](http://blog.keithcirkel.co.uk/why-we-should-stop-using-grunt/)
* It's a more universal solution compatible with any build tool and ui tool (angular, react, riot, pure js) (vs rolling your own as suggested [here](https://github.com/rxaviers/globalize-webpack-plugin/issues/6))

#Usage#

The inputs provided to globalize-plus-compiler are of the same format of [globalize-compiler](https://github.com/jquery-support/globalize-compiler), with the exception of `locale` which can be a comma separated list, but isn't required.  Locales, when not provided, are derived from the messages.json file.

Output is also exactly the same.  Compiled JS files that contain the formatters and messages for the application and locale.

##CLI usage##


> \> globalize-compiler-plus -m test/messages.json -o test/output/ test/*.js

> \> ls -al test/output/

    test/output/
      ├── formatters-de.js
      ├── formatters-en.js
      └── formatters-es.js

##JS usage##

Works, but TBD on docs...
