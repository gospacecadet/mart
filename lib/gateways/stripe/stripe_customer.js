Mart.GatewaysStripeCustomers = new Mongo.Collection("MartStripeCustomers");

Mart.StripeCustomers.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    autoValue: function() {
      return this.userId;
    }
  },
  stripeId: {
    type: String,
  },
}));
