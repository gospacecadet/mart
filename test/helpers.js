Accounts.removeDefaultRateLimit()

randomPrice = function() {
  return Math.floor(Math.exp(10, 3) * Math.random())
}

testIsRecent = function(time, test) {
  var now = new Date().getTime()
  var before = now - (5*1000)
  var after = now + (5*1000)

  test.isTrue(time.getTime() > before)
  test.isTrue(time.getTime() < after)
}

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
    email: 'testuser-' + Random.id() + "@example.com",
    password: 'password-' + Random.id()
  }, function(error) {
    test.isUndefined(error, 'Unexpected error logging in as user');
    Meteor.call("mart/test/add-roles", Meteor.userId(), roles, function(error, userId){
      test.isUndefined(error, 'Unexpected error adding roles to user');
      test.isNotNull(Meteor.userId(), 'User ID is undefined after login');
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

// returns [storefrontId, merchantId]
createTestStorefront = function(test, callback) {
  testLogout(test, function(error) {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, function(error, merchantId) {
      Mart.Storefronts.insert({
        name: "some Storefront",
        description: "woot there it is",
        isPublished: true,
        isDeleted: false
      }, function(error, storefrontId) {
        testLogout(test, function(error) {
          test.isUndefined(error, "Could not create test storefront")
          test.isTrue(typeof storefrontId === "string")
          test.isTrue(typeof merchantId === "string")

          callback(error, {storefrontId: storefrontId, merchantId: merchantId})
        })
      })
    })
  })
}
