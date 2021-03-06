Mart.GatewayTypes.Stripe.Customers = new Mongo.Collection("MartStripeCustomers");

Mart.GatewayTypes.Stripe.Customers.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    autoValue: function() {
      if(this.isInsert) {
        return this.userId;
      }
    }
  },
  stripeToken: {
    type: String,
  },
}));
