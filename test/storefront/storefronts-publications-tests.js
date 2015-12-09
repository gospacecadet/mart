//Storefronts
  // Publications
    // - mart/storefronts no user required to subscribe to published Storefronts
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

  createTestStorefront(test, onLoggedOut)

  function onLoggedOut(error, response) {
    insertedStoreId = response.storefrontId
    Meteor.subscribe("mart/storefronts", insertedStoreId, function() {
      let createdStorefront = Mart.Storefronts.findOne(insertedStoreId)
      test.isNotUndefined(createdStorefront)
      test.equal(createdStorefront.name, expectedStorefront.name)
      test.equal(createdStorefront.description, expectedStorefront.description)
      test.isUndefined(createdStorefront.isPublished)
      test.isUndefined(createdStorefront.userId)

      done()
    })
  }
})

Tinytest.addAsync('Storefronts - Publications - mart/storefront [Merchant] can subscribe to their owned & undeleted Storefronts', function(test, done) {
  var expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: false,
  }
  var insertedStoreId
  testLogout(test, begin)

  function begin() {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, onUserLoggedIn)
  }

  function onUserLoggedIn(error) {
    Mart.Storefronts.insert(_.clone(expectedStorefront), onStorefrontInserted)
  }

  function onStorefrontInserted(error, storefrontId) {
    test.isUndefined(error, "Could not insert a new Storefront")
    test.isTrue(typeof storefrontId === "string")
    insertedStoreId = storefrontId

    Meteor.subscribe("mart/storefront", insertedStoreId, function() {
      let createdStorefront = Mart.Storefronts.findOne(storefrontId)

      test.isNotUndefined(createdStorefront)
      test.equal(createdStorefront.name, expectedStorefront.name)
      test.equal(createdStorefront.description, expectedStorefront.description)
      test.equal(createdStorefront.isPublished, expectedStorefront.isPublished)
      test.equal(createdStorefront.userId, Meteor.userId())

      testLogout(test, onLoggedOut)
    })
  }

  function onLoggedOut(error) {
    // done()
    Meteor.subscribe("mart/storefront", insertedStoreId, function() {
      let createdStorefront = Mart.Storefronts.findOne(insertedStoreId)
      test.isUndefined(createdStorefront)

      done()
    })
  }
})

Tinytest.addAsync('Storefronts - Publications - mart/storefront [Admin] can subscribe to all Storefronts', function(test, done) {
  let expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: false,
    isDeleted: true,
  }
  let insertedStoreId
  let merchantId
  testLogout(test, begin)

  function begin() {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, onUserLoggedIn)
  }

  function onUserLoggedIn(error, userId) {
    merchantId = userId
    Mart.Storefronts.insert(_.clone(expectedStorefront), onStorefrontInserted)
  }

  function onStorefrontInserted(error, storefrontId) {
    test.isUndefined(error, "Could not insert a new Storefront")
    test.isTrue(typeof storefrontId === "string")

    insertedStoreId = storefrontId

    Meteor.subscribe("mart/storefront", insertedStoreId, function() {
      let createdStorefront = Mart.Storefronts.findOne(storefrontId)

      test.isUndefined(createdStorefront)

      testLogout(test, onLoggedOut)
    })
  }

  function onLoggedOut(error) {
    testLogin([Mart.ROLES.GLOBAL.ADMIN], test, onAdminLoggedIn)
  }

  function onAdminLoggedIn(error, adminId) {
    Meteor.subscribe("mart/storefront", insertedStoreId, function() {
      let createdStorefront = Mart.Storefronts.findOne(insertedStoreId)
      test.isNotUndefined(createdStorefront)
      test.equal(createdStorefront.name, expectedStorefront.name)
      test.equal(createdStorefront.description, expectedStorefront.description)
      test.equal(createdStorefront.isPublished, expectedStorefront.isPublished)
      test.equal(createdStorefront.userId, merchantId)

      done()
    })
  }
})

Tinytest.addAsync('Storefronts - Publications - mart/storefront [Rep] can subscribe to all their managed Storefronts', function(test, done) {
  var expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: false,
    userId: "testId"
  }
  var insertedStoreId
  testLogout(test, begin)

  function begin() {
    testLogin([Mart.ROLES.GLOBAL.REP], test, onUserLoggedIn)
  }

  function onUserLoggedIn(error) {
    Mart.Storefronts.insert(_.clone(expectedStorefront), onStorefrontInserted)
  }

  function onStorefrontInserted(error, storefrontId) {
    test.isUndefined(error, "Could not insert a new Storefront")
    test.isTrue(typeof storefrontId === "string")
    insertedStoreId = storefrontId

    Meteor.subscribe("mart/storefront", insertedStoreId, function() {
      let createdStorefront = Mart.Storefronts.findOne(insertedStoreId)

      test.isNotUndefined(createdStorefront)
      test.equal(createdStorefront.name, expectedStorefront.name)
      test.equal(createdStorefront.description, expectedStorefront.description)
      test.equal(createdStorefront.isPublished, expectedStorefront.isPublished)
      test.equal(createdStorefront.userId, expectedStorefront.userId)
      test.equal(createdStorefront.repId, Meteor.userId())

      testLogout(test, onLoggedOut)
    })
  }

  function onLoggedOut(error) {
    Meteor.subscribe("mart/storefront", insertedStoreId, function() {
      let createdStorefront = Mart.Storefronts.findOne(insertedStoreId)
      test.isUndefined(createdStorefront)

      done()
    })
  }
})
