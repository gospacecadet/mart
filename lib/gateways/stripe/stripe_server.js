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
      console.log(error.message)
      throw new Meteor.Error("stripe-charge-error", error.message);
    }
  },
  createCard: function(stripeToken, card, options) {
    var customerToken = this.getCustomerToken(options),
        Stripe = StripeAPI(this.getSecretKey(options))

    var createSource = Meteor.wrapAsync(Stripe.customers.createSource, Stripe.customers);
    try {
      // Add Card to Stripe
      var result = createSource(customerToken, {source: stripeToken});
      card["gatewayToken"] = result.id

      // Add Card to Collection
      var cardId = Mart.Cards.insert(card)
      return cardId
    } catch (error) {
      console.log(error.message);
      throw new Meteor.Error("stripe-customer-source-error", error.message);
    }
  },
  getCustomerToken: function(options) {
    var existingCustomer = this.Customers.findOne({userId: Meteor.userId()}),
        customerToken,
        Stripe = StripeAPI(this.getSecretKey(options))

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
  }
});

Mart.GatewayTypes.Stripe.Customers = new Mongo.Collection("MartStripeCustomers");

Mart.GatewayTypes.Stripe.Customers.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    autoValue: function() {
      return this.userId;
    }
  },
  stripeToken: {
    type: String,
  },
}));
