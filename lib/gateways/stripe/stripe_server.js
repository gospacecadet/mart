var Stripe = StripeAPI(Meteor.settings.stripeSecretKey)
_.extend(Mart.GatewayTypes.Stripe, {
  // Get account info, create a gateway if none exists
  // return gateway._id
  retrieveAccountInfo: function(options) {
    Stripe = StripeAPI(this.getSecretKey(options));
    var retrieveAccount = Meteor.wrapAsync(Stripe.accounts.retrieve, Stripe.accounts);
    try {
      var result = retrieveAccount();

      accountAttrs = {
        gatewayType: "Stripe",
        businessName: result.business_name,
        businessURL: result.business_url,
        detailsSubmitted: result.details_submitted,
        chargesEnabled: result.charges_enabled,
        transfersEnabled: result.transfers_enabled
      }

      Mart.Gateways.upsert({}, {$set: accountAttrs})
      return Mart.Gateways.findOne()._id
    } catch (error) {
      throw new Meteor.Error("stripe-charge-error", error.message);
    }
  },
  createCard: function(stripeToken, card, options) {
    var customerToken = this.getCustomerToken(options)

    var createSource = Meteor.wrapAsync(Stripe.customers.createSource, Stripe.customers);
    try {
      // Add Card to Stripe
      var result = createSource(customerToken, {source: stripeToken});
      card["gatewayToken"] = result.id

      // Add Card to Collection
      var cardId = Mart.Cards.insert(card)
      return cardId
    } catch (error) {
      throw new Meteor.Error("stripe-customer-source-error", error.message);
    }
  },
  getCustomerToken: function(options) {
    var existingCustomer = this.Customers.findOne({userId: Meteor.userId()}),
        customerToken

    // Stripe cards must be added to a customer, see if one exists
    if(existingCustomer) {
      customerToken = existingCustomer.stripeToken
    } else {
      // Customer for this user does noes exist, create one
      var createCustomer = Meteor.wrapAsync(Stripe.customers.create, Stripe.customers);

      try {
        // Create on Stripe
        var result = createCustomer({description: "Customer for user " + Meteor.userId()});
        customerToken = result.id

        // Create in Collection
        var t = this.Customers.insert({stripeToken: customerToken, userId: Meteor.userId()})
      } catch (error) {
        throw new Meteor.Error("stripe-customer-create-error", error.message);
      }
    }
    return customerToken
  }
})

Meteor.methods({
  'mart/stripe/create-card': function(stripeToken, card, options) {
    check(stripeToken, String)
    check(card, {
      last4: String,
      expMonth: Number,
      expYear: Number,
      nameOnCard: String,
      brand: String,
      gateway: String
    })
    check(options, {
      secretKey: Match.Optional(String),
      publicKey: Match.Optional(String),
    })

    cardId = Mart.GatewayTypes.Stripe.createCard(stripeToken, card, options);
    return cardId
  },
  'mart/stripe/create-bank-account': function(bankAccountToken, bankAccount) {
    check(bankAccountToken, String)
    check(bankAccount, {
      name: String,
      last4: String,
      bankName: String,
      routingNumber: String,
      country: String,
      currency: String,
      recipientType: String
    })

    // Find the current user's managed account
    var managedAccount  = Mart.GatewayTypes.Stripe.ManagedAccounts.findOne({userId: Meteor.userId()}),
        Stripe          = StripeAPI(Meteor.settings.stripeSecretKey)

    // Create a new managed account on stripe if one doesn't exist
    if(!managedAccount) {
      var acctId = createManagedAccount()
      managedAccount = Mart.GatewayTypes.Stripe.ManagedAccounts.findOne({
        userId: Meteor.userId(),
        _id: acctId
      })
    }

    // Create a bank account corresponding belonging to the managed account we just created
    return createBankAccount(bankAccountToken, bankAccount, managedAccount)
  }
});

var createBankAccount = function(bankAccountToken, bankAccount, managedAccount) {
  var createBankAccount = Meteor.wrapAsync(Stripe.accounts.createExternalAccount, Stripe.accounts);

  try {
    var result = createBankAccount(managedAccount.stripeToken,
      {external_account: bankAccountToken})

    return Mart.BankAccounts.insert(_.extend(bankAccount, {
      gateway: "Stripe",
      isDefault: result.default_for_currency,
      gatewayToken: result.id
    }))

  } catch (error) {
    throw new Meteor.Error("stripe-external-account-create-error", error.message);
  }
}

// returns returns managed accountId
var createManagedAccount = function() {
  var createAccount = Meteor.wrapAsync(Stripe.accounts.create, Stripe.accounts);
  try {
    // Create on Stripe
    var result = createAccount({
      country: 'US',
      managed: true,
      email: Meteor.user().emails[0].address
    });

    // Create in Collection
    return Mart.GatewayTypes.Stripe.ManagedAccounts.insert({
      stripeToken: result.id,
      stripePublicKey: result.keys.publishable,
      stripePrivateKey: result.keys.secret
    })
  } catch (error) {
    throw new Meteor.Error("stripe-managed-account-create-error", error.message);
  }
}
