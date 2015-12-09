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
  Accounts: {
    // traditional options, roles: [ROLE]
    createUser: function(options, callback) {
      Accounts.createUser(options, function(error) {
        if(error)
          return callback(error)

        Meteor.call("mart/add-roles", options.roles, callback);
      })
    }
  }
})
