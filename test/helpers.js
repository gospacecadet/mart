////////////////////////////////////////////////
// RECHARGE STRIPE ACCOUNT
// curl https://api.stripe.com/v1/tokens \
//    -u sk_test_0cTn23SpzgOTmM3XBNBgqw7W: \
//    -d card[number]=4000000000000077 \
//    -d card[exp_month]=12 \
//    -d card[exp_year]=2016 \
//    -d card[cvc]=123
//
// curl https://api.stripe.com/v1/charges \
//    -u sk_test_0cTn23SpzgOTmM3XBNBgqw7W: \
//    -d amount=40000000 \
//    -d currency=usd \
//    -d source=tok_17JVaHD745soaWcRgVW4JXdc \
//    -d description="Charge for test@example.com"
//////////////////////////////////////////////////

Accounts.removeDefaultRateLimit()

randomPrice = function() {
  return Math.floor(Math.exp(10, 3) * Math.random())
}

testIsRecent = function(time, test) {
  var now = new Date().getTime()
  var before = now - (60*1000)
  var after = now + (60*1000)

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

      Meteor.users.update(Meteor.userId(), {$set: {
        termsAcceptedIP: "127.0.0.1",
        termsAcceptedAt: Math.floor(Date.now() / 1000)
      }})
      return userId
    }
  });
}

// Note to self, continue to use mart/test/add-roles so that roles can be eailty created
// if you get errors, here you probably need to sync the test method with the real mart/add-roles method
testLogin = function(roles, test, callback) {
  let email = 'testuser-' + Random.id() + "@example.com"
  let userId = Accounts.createUser({
    email: email,
    password: 'traphouse'
  }, function(error) {
    test.isUndefined(error, 'Unexpected error logging in as user');
    Meteor.call("mart/test/add-roles", Meteor.userId(), roles, function(error, userId){
      test.isUndefined(error, 'Unexpected error adding roles to user');
      test.isNotNull(Meteor.userId(), 'User ID is undefined after login');
      callback(error, email)
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
createTestStorefront = function(storefront, test, callback) {
  Mart.Storefronts.insert(_.defaults(storefront, {
    name: "some Storefront",
    description: "woot there it is",
    address: "123 Fake St",
    city: "New Orleans",
    state: "LA",
    zip: "70113",
    isPublished: true,
    isDeleted: false
  }), function(error, storefrontId) {
    testError(error, test, "Could not create test storefront")
    test.isTrue(typeof storefrontId === "string")

    callback(error, storefrontId)
  })
}

quickStorefront = function(storefront, test, callback) {
  testLogout(test, function() {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, function() {
      createTestStorefront(storefront, test, function(error, storefrontId) {
        testLogout(test, function() {
          callback(error, storefrontId)
        })
      })
    })
  })
}

createTestProduct = function(product, test, callback) {
  Mart.Products.insert(_.defaults(product, {
    name: "asd;skdf sdf",
    description: "a;sldfjkas;dlf",
    isPublished: true,
    isDeleted: false
  }), function(error, productId) {
    testError(error, test, "Could not create test product")
    test.isTrue(typeof productId === "string")

    callback(error, productId)
  })
}

testError = function(error, test, message) {
  if(error) {
    console.log(error);
  }

  test.isUndefined(error, message)
}
