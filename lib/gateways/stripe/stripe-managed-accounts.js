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
  isLegalEntityVerified: {
    type: Boolean
  },
  isAccountVerified: {
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
    var Stripe = StripeAPI(Meteor.settings.stripeSecretKey)
    var managedAccount = Mart.GatewayTypes.Stripe.ManagedAccounts.findOne({userId: Meteor.userId()})
    var updateAccount = Meteor.wrapAsync(Stripe.accounts.update, Stripe.accounts);
    try {
      // Create on Stripe
      var result = updateAccount(managedAccount.stripeToken, _.extend(details, {
        tos_acceptance: {
          date: Meteor.user().termsAcceptedAt,
          ip: Meteor.user().termsAcceptedIP,
        }
      }));

      return result.transfers_enabled
    } catch (error) {
      throw new Meteor.Error("stripe-managed-account-create-error", error.message);
    }
  }
});
