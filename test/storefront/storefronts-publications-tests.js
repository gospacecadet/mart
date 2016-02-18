//Storefronts
  // Publications
    // - mart/storefronts no user required to subscribe to published Storefronts
    // - mart/storefront no user required to subscribe to a published Storefront
    // - mart/storefront [Merchant] can subscribe to their owned & undeleted Storefronts
    // - mart/storefront [Admin] can subscribe to all Storefronts
    // - mart/storefront [Rep] can subscribe to all their managed Storefronts

Tinytest.addAsync('Storefronts - Publications - mart/storefronts no user required to view published', function(test, done) {
  var expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: true,
    isDeleted: false
  }
  var insertedStoreId

  quickStorefront(expectedStorefront, test, examineStorefront)

  var sub1
  function examineStorefront(error, response) {
    insertedStoreId = response
    sub1 = Meteor.subscribe("mart/storefronts", function() {
      let createdStorefront = Mart.Storefronts.findOne(insertedStoreId)
      test.isNotUndefined(createdStorefront)
      test.equal(createdStorefront.name, "some Storefront")
      test.equal(createdStorefront.description, "woot there it is")
      test.isUndefined(createdStorefront.isPublished)
      test.isUndefined(createdStorefront.userId)

      sub1.stop()
      done()
    })
  }
})

Tinytest.addAsync('Storefronts - Publications - mart/storefront no user required to subscribe to a published Storefront', function(test, done) {
  var expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: true,
    isDeleted: false,
  }
  var insertedStoreId

  quickStorefront(expectedStorefront, test, onLoggedOut)

  function onLoggedOut(error, response) {
    insertedStoreId = response
    var sub = Meteor.subscribe("mart/storefront", insertedStoreId, function() {
      let createdStorefront = Mart.Storefronts.findOne(insertedStoreId)
      test.isNotUndefined(createdStorefront)
      test.equal(createdStorefront.name, "some Storefront")
      test.equal(createdStorefront.description, "woot there it is")
      test.isUndefined(createdStorefront.isPublished)
      test.isUndefined(createdStorefront.userId)

      sub.stop()
      done()
    })
  }
})

_.each([
  Mart.ROLES.GLOBAL.MERCHANT,
  Mart.ROLES.GLOBAL.REP,
  Mart.ROLES.GLOBAL.ADMIN
], function(role) {
  Tinytest.addAsync('Storefronts - Publications - mart/storefront ' + role + ' can subscribe to their owned & undeleted Storefronts', function(test, done) {
    var expectedStorefront = {
      name: "some Storefront",
      description: "woot there it is",
      isPublished: false,
      userId: "fakeId" // This userId will only be used if Admin or Rep
    }
    var insertedStoreId
    testLogout(test, begin)

    function begin() {
      testLogin(role, test, onUserLoggedIn)
    }

    function onUserLoggedIn(error) {
      createTestStorefront(expectedStorefront, test, onStorefrontInserted)
    }

    function onStorefrontInserted(error, storefrontId) {
      insertedStoreId = storefrontId

      var sub1 = Meteor.subscribe("mart/storefront", insertedStoreId, function() {
        let createdStorefront = Mart.Storefronts.findOne(storefrontId)

        test.isNotUndefined(createdStorefront)
        test.equal(createdStorefront.name, "some Storefront")
        test.equal(createdStorefront.description, "woot there it is")
        test.isFalse(createdStorefront.isPublished)
        test.isTrue(createdStorefront.userId === Meteor.userId() ||
          createdStorefront.userId === "fakeId")
        sub1.stop()
        testLogout(test, onLoggedOut)
      })
    }

    function onLoggedOut(error) {
      var sub2 = Meteor.subscribe("mart/storefront", insertedStoreId, function() {
        let createdStorefront = Mart.Storefronts.findOne(insertedStoreId)
        test.isUndefined(createdStorefront)

        sub2.stop()
        done()
      })
    }
  })
})
