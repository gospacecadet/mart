if(Meteor.isServer){
  Meteor.methods({
    'mart/test/add-roles': function(userId, roles){
      if (roles.length > 0) {
        // Need _id of existing user record so this call must come
        // after `Accounts.createUser` or `Accounts.onCreate`
        // only allowed on server side
        Roles.addUsersToRoles(userId, roles, Mart.ROLES.GROUPS.GLOBAL);
      }

      return userId
    }
  });
}

testLogin = function(roles, test, callback) {
  let userId = Accounts.createUser({
    username: 'testuser-' + Random.id(),
    password: 'password-' + Random.id()
  }, function(error) {
    test.isUndefined(error, 'Unexpected error logging in as user');
    Meteor.call("mart/test/add-roles", Meteor.userId(), roles, function(error, userId){
      test.isUndefined(error, 'Unexpected error adding roles to user');
      callback(error, userId)
    });
  });
}

testLogout = function(test, callback) {
  Meteor.logout(function(error){
    test.isUndefined(error, 'Unexpected error logging out as user');
    test.isNull(Meteor.userId(), 'User ID is not undefined after logout');
    callback(error)
  });
}
