function Globalizer(){
	var self = riot.observable(this)
	self.m = function(path, args){
		var slicedArgs = Array.prototype.slice.call(arguments, 1);
		var g = Globalize
		return g.messageFormatter(path)(slicedArgs)
	}
	/**
	 * Provide shorthands to globalize:
	 *  _ = globalizer.underbar()
	 *  _('message') -> looks up message
	 *  _.usd(127.043) -> $127.04
	 * @return {func} self.m with attached methods
	 */
	self.underbar = function(){
		self.m.date = self.date
		self.m.number = self.number
		self.m.usd = self.usd
		self.m.eur = self.eur
		self.m.plural = self.plural
		self.m.relTime = self.relTime
		self.m.parseNumber = self.parseNumber

		return self.m
	}
	self.load = function(locale){
		$.getScript('js/formatters-' + locale + '.js')
			.done(function(script, textStatus){
				console.log(textStatus)
				Globalize.locale( locale );
				self.locale = locale

				// Use Globalize to format dates.
				self.date = Globalize.dateFormatter({
					datetime: "medium"
				});

				// Use Globalize to format numbers.
				self.number = Globalize.numberFormatter();

				// Use Globalize to format currencies.
				self.usd = Globalize.currencyFormatter ( "USD" );
				self.eur = Globalize.currencyFormatter ( "EUR" );

				self.parseNumber = Globalize.numberParser();

				// Use Globalize to get the plural form of a numeric value.
				self.plural = Globalize.pluralGenerator ( );

				// message formatters are automatically injected via a HACK: in the
				// gulpfile script.

				// Use Globalize to format a relative time.
				self.relTime = Globalize.relativeTimeFormatter("second")//( -35, "second" );

				self.underbar()
				self.trigger('globalize-complete')
			})
			.fail(function(jqxhr, settings, exception){
				console.log("error loading globalize formatters from server")
			})
	}
}
