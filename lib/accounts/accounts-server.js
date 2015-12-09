// Cannot already be logged in if creating a new user
Accounts.validateNewUser(function (user) {
  if(Meteor.userId()) {
    throw new Meteor.Error(403, "Not authorized to create new users");
  } else {
    return true
  }
});

// Only Shoppers and Merchants can be created
var areRolesValid = function(roles) {
  let allowedRolesWithoutLogin = [
    Mart.ROLES.GLOBAL.SHOPPER,
    Mart.ROLES.GLOBAL.MERCHANT
  ]

  let sanitizedRoles = _.intersection(roles, allowedRolesWithoutLogin)
  return sanitizedRoles.length === roles.length
}

Meteor.methods({
  'mart/add-roles': function(roles) {
    roles = roles || [Mart.ROLES.GLOBAL.SHOPPER]

    if(areRolesValid(roles)) {
      _.each(roles, function(role) {
        Roles.addUsersToRoles(Meteor.userId(), roles, Mart.ROLES.GROUPS.GLOBAL);
      })
    } else {
      throw new Meteor.Error(403, "You do not have permission to assume that role.");
    }
  }
});
