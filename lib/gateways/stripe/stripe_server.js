
_.extend(Mart.GatewayTypes.Stripe, {
  // Get account info, create a gateway if none exists
  // return gateway._id
  retrieveAccountInfo: function() {
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
  createCard: function(stripeToken, card) {
    // console.log('server#createCard');
    var customerToken = this.getCustomerToken()
    var Stripe = StripeAPI(Mart.STRIPE_SECRET_KEY)
    var createSource = Meteor.wrapAsync(Stripe.customers.createSource, Stripe.customers);
    try {
      // Add Card to Stripe
      var result = createSource(customerToken, {source: stripeToken});
      card["gatewayToken"] = result.id
      // Add Card to Collection
      var cardId = Mart.Cards.insert(card)
      return cardId
    } catch (error) {
      console.log(error);
      throw new Meteor.Error("stripe-customer-source-error", error);
    }
  },
  getCustomerToken: function() {
    var Stripe = StripeAPI(Mart.STRIPE_SECRET_KEY)
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
  'mart/stripe/create-card': function(stripeToken, card) {
    check(stripeToken, String)
    check(card, {
      last4: String,
      expMonth: Number,
      expYear: Number,
      nameOnCard: String,
      brand: String,
      gateway: String
    })

    cardId = Mart.GatewayTypes.Stripe.createCard(stripeToken, card);
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
        Stripe          = StripeAPI(Mart.STRIPE_SECRET_KEY)

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
  var Stripe = StripeAPI(Mart.STRIPE_SECRET_KEY)
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
  var Stripe = StripeAPI(Mart.STRIPE_SECRET_KEY)
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
      stripePrivateKey: result.keys.secret,
      isLegalEntityVerified: isLegalEntityVerified(result.legal_entity.verification),
      isAccountVerified: result.transfers_enabled
    })
  } catch (error) {
    throw new Meteor.Error("stripe-managed-account-create-error", error.message);
  }
}

var isLegalEntityVerified = function(stripeDesc) {
  return (stripeDesc === "verified") ? true : false
}
