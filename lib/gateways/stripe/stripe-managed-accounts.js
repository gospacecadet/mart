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
  "mart/stripe/verify": function() {
    user = Meteor.users.findOne(Meteor.userId())

    if(!user.termsAcceptedIP) {
      Meteor.users.update(Meteor.userId(), {$set: {
        termsAcceptedIP: clientIP(),
        termsAcceptedAt: Math.floor(Date.now() / 1000)
      }})
    }

    var Stripe = StripeAPI(Mart.STRIPE_SECRET_KEY)
    var managedAccount = Mart.GatewayTypes.Stripe.ManagedAccounts.findOne({userId: Meteor.userId()})
    var updateAccount = Meteor.wrapAsync(Stripe.accounts.update, Stripe.accounts);
    try {
      // Create on Stripe
      var result = updateAccount(managedAccount.stripeToken, {
        legal_entity: {
          dob: {
            day: user.profile.dobDay, // The day of birth, between 1 and 31
            month: user.profile.dobMonth, // The month of birth, between 1 and 12
            year: user.profile.dobYear, // The 4-digit year of birth
          },
          business_name: user.profile.businessName,
          first_name: user.profile.firstName,
          last_name: user.profile.lastName,
          type: user.profile.typeOnGateway
        },
        tos_acceptance: {
          ip: termsAcceptedIP,
          date: termsAcceptedAt
        }
      });

      return result.transfers_enabled
    } catch (error) {
      throw new Meteor.Error("stripe-managed-account-create-error", error.message);
    }
  },
});
