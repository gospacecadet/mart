Mart.Gateways.Stripe = {
  retrieveAccountInfo: function(gateway) { // assume contract exists
    accountAttrs = {
      businessName: "Test Gateway Business Name",
      businessURL: "example.com",
      detailsSubmitted: false,
      chargesEnabled: false,
      transfersEnabled: false
    }

    Mart.Gateways.upsert({name: gateway.name}, {$set: accountAttrs})
    return accountAttrs
  },
}

Mart.Gateways.Stripe.Customers = new Mongo.Collection("MartStripeCustomers");

Mart.Gateways.Stripe.Customers.attachSchema(new SimpleSchema({
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
