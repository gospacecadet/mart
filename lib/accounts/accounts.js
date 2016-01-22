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
    return this._isAdmin(Meteor.userId())
  },
  isRep: function() {
    return this._isRep(Meteor.userId())
  },
  isMerchant: function() {
    return this._isMerchant(Meteor.userId())
  },
  isShopper: function() {
    return this._isShopper(Meteor.userId())
  },
  isGuest: function() {
    return this._isGuest(Meteor.userId())
  },
  canActAsMerchant: function() {
    return this.isMerchant() || this.isRep() || this.isAdmin()
  },
  _isGuest: function(userId) {
    return !userId
  },
  _isAdmin: function(userId) {
    return Roles.userIsInRole(userId,
      [Mart.ROLES.GLOBAL.ADMIN],
      Mart.ROLES.GROUPS.GLOBAL)
  },
  _isRep: function(userId) {
    return Roles.userIsInRole(userId,
      [Mart.ROLES.GLOBAL.REP],
      Mart.ROLES.GROUPS.GLOBAL)
  },
  _isMerchant: function(userId) {
    return Roles.userIsInRole(userId,
      [Mart.ROLES.GLOBAL.MERCHANT],
      Mart.ROLES.GROUPS.GLOBAL)
  },
  _isShopper: function(userId) {
    return Roles.userIsInRole(userId,
      [Mart.ROLES.GLOBAL.SHOPPER],
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

  }
})
