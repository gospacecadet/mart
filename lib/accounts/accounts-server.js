// Cannot already be logged in if creating a new user
Accounts.validateNewUser(function (user) {
  if(this.userId) {
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
var clientIP = function() {
  // var env = process.env.NODE_ENV;
  var env = false

  if (env === 'production') {
    return this.connection.clientAddress;
  } else {
    return '127.0.0.1'
  }
}

Meteor.methods({
  'mart/add-roles-and-terms': function(roles) {
    check(roles, Match.OneOf([String], undefined, null))
    roles = roles || [Mart.ROLES.GLOBAL.SHOPPER]

    if(areRolesValid(roles)) {
      _.each(roles, function(role) {
        Roles.addUsersToRoles(Meteor.userId(), roles, Mart.ROLES.GROUPS.GLOBAL);
      })
      Meteor.users.update(Meteor.userId(), {$set: {
        termsAcceptedIP: clientIP(),
        termsAcceptedAt: Math.floor(Date.now() / 1000)
      }})

      Accounts.sendVerificationEmail(Meteor.userId())
    } else {
      throw new Meteor.Error(403, "You do not have permission to assume that role.");
    }
  }
});

Meteor.publish("mart/user-terms-data", function () {
  if (this.userId) {
    return Meteor.users.find(
      {_id: this.userId},
      {fields: {'termsAcceptedAt': 1, 'termsAcceptedIP': 1}});
  } else {
    this.ready();
  }
});
