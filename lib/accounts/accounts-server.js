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

    var userId = Meteor.userId()

    if(areRolesValid(roles)) {
      _.each(roles, function(role) {
        Roles.addUsersToRoles(userId, roles, Mart.ROLES.GROUPS.GLOBAL);
      })
      Meteor.users.update(userId, {$set: {
        termsAcceptedIP: clientIP(),
        termsAcceptedAt: Math.floor(Date.now() / 1000)
      }})

      sendWelcomeEmail(userId)
      // Accounts.sendVerificationEmail(userId)
    } else {
      throw new Meteor.Error(403, "You do not have permission to assume that role.");
    }
  },
  "mart/update-user": function(userDetails) {
    console.log(userDetails);
    check(userDetails, {
      username: String,
      email: String,
      profile: {
        phoneNumber: Match.Optional(String),
        firstName: Match.Optional(String),
        lastName: Match.Optional(String),
        businessName: Match.Optional(String),
      }
    })
    var userId = Meteor.userId()
    if(userId) {
      var user = Meteor.users.findOne(userId)

      // Don't allow users to change username
      if(!user.username) {
        Accounts.setUsername(userId, userDetails.username)
      } else if(user.username !== userDetails.username) {
        throw new Meteor.Error('cannot-change-username', "You cannot reset your username.")
      }

      // Change address if different
      var oldEmail = user.emails[0].address
      var newEmail = userDetails.email
      if(oldEmail !== newEmail) {
        Accounts.addEmail(userId, newEmail)
        Accounts.removeEmail(userId, oldEmail)
      }

      // Set profile
      var profile = userDetails.profile
      return Meteor.users.update(userId, {$set: {
        "profile.firstName": profile.firstName,
        "profile.phoneNumber": profile.phoneNumber,
        "profile.lastName": profile.lastName,
        "profile.businessName": profile.businessName,
      }})

    } else {
      throw new Meteor.Error('not-logged-in', "You must be logged in to do update a profile.")
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
