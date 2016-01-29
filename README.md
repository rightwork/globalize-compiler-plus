# Overview

Wraps [globalize-compiler](https://github.com/jquery-support/globalize-compiler) to allow for simpler use:

1. Locales are inferred from Messages.json file
2. All keys/values in Messages.json are compiled into the output, without having to reference them statically in the input .js files

# Background

I started with [globalize-webpack-plugin](https://github.com/rxaviers/globalize-webpack-plugin), but had some dislikes/issues:

* There is some narly stuff going on in [this example](https://github.com/jquery/globalize/blob/master/examples/app-npm-webpack/index-template.html) at the bottom of file.  I'd prefer complicating the build process over the product
* The example also unfortunately works for just one locale, and its unclear to me, being new to the JS world, what I would need to do to get that to work
* It is unusable for me.  Partly documented [here](https://github.com/rxaviers/globalize-webpack-plugin/issues/6), you must statically reference every key (that you'd like bundled) in your message json.  

This solution aims to simplify and close the gap on the above issues.  I chose to build from globalize-compiler for a few reasons:
* It's 95% there
* CLI and simple function calls easier to reason about vs webpack and globalize internals. Something like [KISS](http://blog.keithcirkel.co.uk/why-we-should-stop-using-grunt/)
* It's a more universal solution compatible with any build tool and UI tool (angular, react, riot, pure js vs rolling your own as suggested [here](https://github.com/rxaviers/globalize-webpack-plugin/issues/6))

# Usage

The inputs provided to globalize-plus-compiler are of the same format of [globalize-compiler](https://github.com/jquery-support/globalize-compiler), with the exception of `locale` which can be a comma separated list, but isn't required.  Locales, when not provided, are derived from the messages.json file.

Output is also exactly the same.  Compiled JS files that contain the formatters and messages for the application and locale.

Use npm scripts, gulp tasks, etc... to run this.

## CLI

> \> npm install globalize-compiler-plus --save-dev

> \> globalize-compiler-plus -m test/messages.json -o test/output/ test/*.js

> \> ls -al test/output/

    test/output/
      ├── formatters-de.js
      ├── formatters-en.js
      └── formatters-es.js

## JS usage

Works, but TBD on docs...

# Thanks

[rxaviers](https://github.com/rxaviers) and the [Globalize](https://github.com/jquery/globalize) team
