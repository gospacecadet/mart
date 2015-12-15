_.extend(Mart.GatewayTypes.Stripe, {
  setPublishableKey: function(key) {
    Stripe.setPublishableKey(key);
  },
  // Get a token for the card from stripe from client side
  // NEVER SEND CARD DETAILS TO SERVER!
  createCard: function(card, options, callback) {
    var stripeCard = {
      number: card.number,
      exp_month: card.expMonth,
      exp_year: card.expYear,
      cvc: card.cvc
    }
    this.setPublishableKey(this.getPublicKey(options))
    Stripe.card.createToken(stripeCard, function(status, response) {
      var error = response.error

      if(error) {
        return callback(error, response)
      }

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
  createBankAccount: function(bankAccount, options, callback) {
    this.setPublishableKey(this.getPublicKey(options))
    var stripeBankAccount = {
      "country": "US",
      "currency": "USD",
      "account_number": accountNumber,
      "routing_number": routingNumber,
    }

    // use to create a bank token
    // send to server to create a recipient ()
  }
})
