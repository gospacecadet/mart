loginWCallback = function(test, callback) {
  console.log("loginWCallback");
  var username1 = 'testuser1-' + Random.id();
  var password1 = 'password1-' + Random.id();
  Accounts.createUser({
    username: username1,
    password: password1
  }, function(err) {
    test.isUndefined(err, 'Unexpected error logging in as user1');
    callback(err)
  });
}
