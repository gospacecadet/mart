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
  }
})

if(Meteor.isServer){
  Accounts.validateNewUser(function (user) {
    // user.profile = _.omit(user.profile, 'roles')

    // user logged in
    if(Meteor.userId()) {
      return false
    } else {
      // Only Shoppers and Merchants can be created when not logged in
      let allowedRolesWithoutLogin = [
        Mart.ROLES.GLOBAL.SHOPPER,
        Mart.ROLES.GLOBAL.MERCHANT
      ]

      let sanitizedRoles = _.intersection(user.profile.roles, allowedRolesWithoutLogin)
      return sanitizedRoles.length === user.profile.roles.length
    }

    // throw new Meteor.Error(403, "Not authorized to create new users");
  });

  Meteor.methods({
    'mart/accounts/create':function(user) {
       id = Accounts.createUser({
         email: user.email,
         password: user.password
       })

       if(user.roles.length > 0) {
         Roles.addUsersToRoles(id, user.roles, );
       }
    }
  });
}
