//admin can view any store
//rep can view any store they've created

Tinytest.addAsync('Storefronts - Publications - mart/storefronts no user required to view published', function(test, done) {
  var expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: true,
    userId: "hacker"
  }
  var insertedStoreId

  testLogin([Mart.ROLES.GLOBAL.SHOPPER], test, onUserLoggedIn)

  function onUserLoggedIn(error, merchantId) {
    Mart.Storefronts.insert(_.clone(expectedStorefront), onStorefrontInserted)
  }

  function onStorefrontInserted(error, storefrontId) {
    test.isUndefined(error, "Could not insert a new Storefront")
    test.isTrue(typeof storefrontId === "string")

    insertedStoreId = storefrontId
    testLogout(test, onLoggedOut)
  }

  function onLoggedOut(error) {
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

Tinytest.addAsync('Storefronts - Publications - mart/storefront Merchant can subscribe to their owned Storefronts', function(test, done) {
  var expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: true,
    userId: "hacker"
  }
  var insertedStoreId

  testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, onUserLoggedIn)

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
    Meteor.subscribe("mart/storefront", insertedStoreId, function() {
      let createdStorefront = Mart.Storefronts.findOne(insertedStoreId)
      test.isNotUndefined(createdStorefront)

      done()
    })
  }
})
