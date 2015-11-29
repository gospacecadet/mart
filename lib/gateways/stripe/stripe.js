Mart.GatewayTypes.Stripe = {
  getSecretKey: function(options) {
    return options.secretKey || Meteor.settings.StripeSecretKey
  },
  getPublicKey: function(options) {
    return options.publicKey || Meteor.settings.public.StripePublicKey
  },
}
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

function getSecretKey(options) {
  return options.secretKey || Meteor.settings.StripeSecretKey
}
