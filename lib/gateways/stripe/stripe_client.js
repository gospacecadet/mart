Meteor.startup(function() {
  Stripe.setPublishableKey(Meteor.settings.public.MartStripePublicKey);
});

_.extend(Mart.Stripe, {
  createCardToken: function(contract, card, callback) {
    Stripe.card.createToken(card, function(error, result) {
      parsedResult =  _.pick(result.card,
        "brand", "last4", "exp_month", "exp_year"
      )
      parsedResult['token'] = result.id
      callback(error, parsedResult)
    });
  },
  setPublishableKey: function(key) {
    Stripe.setPublishableKey(key);
  }
})
