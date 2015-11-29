Meteor.startup(function() {
  Stripe.setPublishableKey(Meteor.settings.public.MartStripePublicKey);
});

_.extend(Mart.GatewayTypes.Stripe, {
  // createCardToken: function(contract, card, callback) {
  //   Stripe.card.createToken(card, function(error, result) {
  //     parsedResult =  _.pick(result.card,
  //       "brand", "last4", "exp_month", "exp_year"
  //     )
  //     parsedResult['token'] = result.id
  //     callback(error, parsedResult)
  //   });
  // },
  setPublishableKey: function(key) {
    Stripe.setPublishableKey(key);
  },
  // Get a token for the card from stripe from client side
  // NEVER SEND CARD DETAILS TO SERVER!
  createCard: function(card, options, callback) {
    console.log("StripeClient#createCard");
    var stripeCard = {
      number: card.number,
      exp_month: card.expMonth,
      exp_year: card.expYear,
      cvc: card.cvc
    }
    console.log("StripeClient#createToken " + card);
    this.setPublishableKey(this.getPublicKey(options))
    Stripe.card.createToken(stripeCard, function(status, response) {
      console.log('inside createToken')
      console.log(status)
      console.log(response)
      var error = response.error

      if(error) {
        console.log("StripeClient#error");
        return callback(error, response)
      }
      console.log("StripeClient#result " + response.id);

      Meteor.call('mart/stripe/create-card', response.id, {
        brand: response.card.brand,
        last4: response.card.last4,
        expMonth: response.card.exp_month,
        expYear: response.card.exp_year,
        nameOnCard: card.nameOnCard,
        gateway: "Stripe",
      }, options, callback)
    });
  },
})
