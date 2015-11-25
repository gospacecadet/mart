Meteor.startup(function() {
  Stripe.setPublishableKey(Meteor.settings.MartStripePublicKey);
});

_.extend(Mart.Stripe, {
  createCardToken: function(contract, card, callback) {
    //ccNum, cvc, expMo, exp
    var error, accountAttrs, result

    Stripe.card.createToken(card, callback);
    // try {
    //   result = createToken(card, function(e,r) {
    //     console.log(result)
    //
    //   });
    //   // accountAttrs = {
    //   //   token: result.token,
    //   //   // brand: result.card.brand
    //   // }
    // } catch (error) {
    //   throw new Meteor.Error("stripe-charge-error", error.message);
    // }
    // return accountAttrs
    // return "hat"
  },
  setPublishableKey: function(key) {
    Stripe.setPublishableKey(key);
  }
})
