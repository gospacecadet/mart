loginWCallback = function(test, callback) {
  var username1 = 'testuser1-' + Random.id();
  var password1 = 'password1-' + Random.id();
  Accounts.createUser({
    username: username1,
    password: password1
  }, function(error) {
    test.isUndefined(error, 'Unexpected error logging in as user');
    callback(error)
  });
}

logoutWCallback = function(test, callback) {
  Meteor.logout(function(error){
    test.isUndefined(error, 'Unexpected error logging out as user');
    callback(error)
  });
}
