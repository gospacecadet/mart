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
  createCard: function(card, callback) {
    console.log("StripeClient#createCard");
    card = {
      number: card.number,
      exp_month: card.expMonth,
      exp_year: card.expYear,
      cvc: card.cvc
    }
    console.log("StripeClient#createToken " + card);
    Stripe.setPublishableKey('pk_test_cUA2GkVEAZpwSRZk3DilRcTR')
    Stripe.card.createToken(card, function(status, response) {
      var error = response.error
      console.log(response)
      // callback(status, result)
      if(error) {
        console.log("StripeClient#error");
        return callback(error, response)
      }
      console.log("StripeClient#result " + response.id);
      parsedResult =  _.pick(response.card,
        "brand", "last4", "exp_month", "exp_year"
      )
      parsedResult['nameOnCard'] = card.nameOnCard
      console.log("StripeClient#call " + parsedResult);
      // return callback(error, response)
      Meteor.call('mart/stripe/create-card', response.id, parsedResult, callback)
    });
  },
})
