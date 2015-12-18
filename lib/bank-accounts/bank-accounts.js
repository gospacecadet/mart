Mart.BankAccounts = new Mongo.Collection("MartBankAccounts");

// only admins + merchants can see accoutns - publications
// needs a method to add account with a
// allow update of name and isDefault - secutiry

Mart.BankAccounts.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    denyUpdate: true,
    autoValue: function() {
      return Meteor.userId()
    }
  },
  name: {
    type: String
  },
  bankName: {
    type: String,
    denyUpdate: true
  },
  last4: {
    type: String,
    denyUpdate: true
  },
  routingNumber: {
    type: String,
    denyUpdate: true
  },
  isDefault: {
    type: Boolean,
  },
  isVerified: {
    type: Boolean
  },
  gateway: {
    type: String
  },
  gatewayToken: {
    type: String
  },
  country: {
    type: String
  },
  currency: {
    type: String
  }
}))
