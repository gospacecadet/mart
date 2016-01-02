_.extend(Mart, {
  ROLES: {
    GLOBAL: {
      SHOPPER: 'mart-roles-golbal-shopper',
      MERCHANT: 'mart-roles-golbal-merchant',
      ADMIN: 'mart-roles-global-admin',
      REP: 'mart-roles-global-rep'
    },
    GROUPS: {
      GLOBAL: 'mart-roles-groups-global'
    }
  },
  isAdmin: function() {
    return Roles.userIsInRole(Meteor.userId(),
      [Mart.ROLES.GLOBAL.ADMIN],
      Mart.ROLES.GROUPS.GLOBAL)
  },
  isRep: function() {
    return Roles.userIsInRole(Meteor.userId(),
      [Mart.ROLES.GLOBAL.REP],
      Mart.ROLES.GROUPS.GLOBAL)
  },
  isMerchant: function() {
    return Roles.userIsInRole(Meteor.userId(),
      [Mart.ROLES.GLOBAL.MERCHANT],
      Mart.ROLES.GROUPS.GLOBAL)
  },
  Accounts: {
    // traditional options, roles: [ROLE]
    createUser: function(options, callback) {
      if(!Meteor.userId()) {
        Accounts.createUser(options, function(error) {
          if(error)
            return callback(error)

          Meteor.call("mart/add-roles-and-terms", options.roles, callback);
        })
      } else {
        callback(new Meteor.Error('signup-error', "You must log out before creating another account."))
      }
    },
    SignInSchema: new SimpleSchema({
      email: {
        type: String,
      },
      password: {
        type: String,
      },
      termsAccepted: {
        type: Boolean
      }
    }),
    ShopperSignUpSchema: new SimpleSchema({
      email: {
        type: String,
      },
      password: {
        type: String,
        min: 8,
      },
      termsAccepted: {
        type: Boolean,
        allowedValues: [true]
      },
      phoneNumber: {
        type: String
      }
    }),
    MerchantSignUpSchema: new SimpleSchema({
      email: {
        type: String,
      },
      password: {
        type: String,
        min: 8,
      },
      contactFirstName: {
        type: String
      },
      contactLastName: {
        type: String
      },
      phoneNumber: {
        type: String
      },
      companyName: {
        type: String,
        optional: true
      },
      termsAccepted: {
        type: Boolean,
        allowedValues: [true]
      }
    })
  }
})
