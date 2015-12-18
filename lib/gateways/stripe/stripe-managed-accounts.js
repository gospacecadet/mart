Mart.GatewayTypes.Stripe.ManagedAccounts = new Mongo.Collection("MartStripeManagedAccounts")
Mart.GatewayTypes.Stripe.ManagedAccounts.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    autoValue: function() {
      return this.userId;
    }
  },
  stripeToken: {
    type: String
  },
  stripePublicKey: {
    type: String
  },
  stripePrivateKey: {
    type: String
  },
  isVerified: {
    type: Boolean
  },
  dobDay: {
    type: Number,
    optional: true
  },
  dobMonth: {
    type: Number,
    optional: true
  },
  dobYear: {
    type: Number,
    optional: true
  },
  firstName: {
    type: String,
    optional: true
  },
  lastName: {
    type: String,
    optional: true
  },
  legalEntityType: {
    type: String,
    optional: true
  }
}));

Meteor.methods({
  "mart/stripe/verify": function(details) {

  }
});
