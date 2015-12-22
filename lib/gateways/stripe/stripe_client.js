_.extend(Mart.GatewayTypes.Stripe, {
  setPublishableKey: function() {
    Stripe.setPublishableKey(Meteor.settings.public.stripePublicKey);
  },
  // Get a token for the card from stripe from client side
  // NEVER SEND CARD DETAILS TO SERVER!
  // If guest, return token. Otherwise, send token to server to create a card object
  createCard: function(card, callback) {
    var stripeCard = {
      number: card.number,
      exp_month: card.expMonth,
      exp_year: card.expYear,
      cvc: card.cvc
    }
    this.setPublishableKey()
    Stripe.card.createToken(stripeCard, function(status, response) {
      var error = response.error

      if(error) {
        return callback(error, response)
      }

      if(!!Meteor.userId()) {
        Meteor.call('mart/stripe/create-card', response.id, {
          brand: response.card.brand,
          last4: response.card.last4,
          expMonth: response.card.exp_month,
          expYear: response.card.exp_year,
          nameOnCard: card.nameOnCard,
          gateway: "Stripe",
        }, callback)
      } else {
        callback(undefined, response.id)
      }

    });
  },
  createBankAccount: function(bankAccount, callback) {
    this.setPublishableKey()
    var stripeBankAccount = {
      "country": "US",
      "currency": "USD",
      "account_number": bankAccount.accountNumber,
      "routing_number": bankAccount.routingNumber,
    }

    Stripe.bankAccount.createToken(stripeBankAccount, function(status, response) {
      if (response.error) {
        return callback(status, response)
      } else {
        var account = {
          name: bankAccount.name,
          last4: response.bank_account.last4,
          bankName: response.bank_account.bank_name,
          routingNumber: response.bank_account.routing_number,
          country: response.bank_account.country,
          currency: response.bank_account.currency,
          recipientType: bankAccount.recipientType
        }

        Meteor.call("mart/stripe/create-bank-account", response.id, account, callback);
      }
    })
  },
  VERIFIABLE_ACCOUNT_DETAILS_SCHEMA: new SimpleSchema({
    dobDay: {
      type: Number
    },
    dobMonth: {
      type: Number
    },
    dobYear: {
      type: Number
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    legalEntityType: {
      type: String,
    }
  })
})
