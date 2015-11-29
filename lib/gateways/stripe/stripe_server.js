_.extend(Mart.GatewayTypes.Stripe, {
  retrieveAccountInfo: function(options) {
    console.log("Stripe#retrieveAccountInfo");
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
    var existingCustomer = this.Customers.findOne({userId: Meteor.userId()}),
        customerToken,
        Stripe = StripeAPI(this.getSecretKey(options))

    // Stripe cards must be added to a customer, see if one exists
    if(existingCustomer) {
      console.log("existingCustomer");
      customerToken = existingCustomer.stripeId
    } else {
      console.log("noi existingCustomer");
      // Customer for this user does noes exist, create one
      var createCustomer = Meteor.wrapAsync(Stripe.customers.create, Stripe.customers);

      try {
        // Create on Stripe
        var result = createCustomer({description: "Customer for user " + this.userId});
        console.log("createCustomer");
        customerToken = result.id

        // Create in Collection
        this.Customers.insert({stripeToken: customerToken})
      } catch (error) {
        console.log(error.message);
        throw new Meteor.Error("stripe-customer-create-error", error.message);
      }
    }

    console.log("about to create source for customer");
    var createSource = Meteor.wrapAsync(Stripe.customers.createSource, Stripe.customers);
    try {
      // Add Card to Stripe
      var result = createSource(customerToken, {source: stripeToken});
      card["gatewayToken"] = response.id
      console.log("crated customer source");
      // Add Card to Collection
      return Mart.Cards.insert(card)
    } catch (error) {
      console.log("customer error " + error.message);
      throw new Meteor.Error("stripe-customer-source-error", error.message);
    }
    return "mart"
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

    Mart.GatewayTypes.Stripe.createCard(stripeToken, card, options);
  }
});
