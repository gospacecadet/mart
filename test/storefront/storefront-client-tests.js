Tinytest.addAsync('Storefront - Subscribe to owned storefronts', function(test, done) {
  var expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: false,
    userId: "hacker"
  }
  var insertedStoreId

  loginWCallback(test, onUserLoggedIn)
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
      test.isTrue(createdStorefront.userId !== expectedStorefront.userId)

      logoutWCallback(test, onLoggedOut)
    })
  }

  function onLoggedOut(error) {
    test.isUndefined(error, "Could not login user")
    Meteor.subscribe("mart/storefront", insertedStoreId, function() {
      let createdStorefront = Mart.Storefronts.findOne(insertedStoreId)
      test.isUndefined(createdStorefront)
      done()
    })
  }
})


Tinytest.addAsync('Storefront - Subscribe to unowned storefronts', function(test, done) {
  var expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: true,
    userId: "hacker"
  }
  var insertedStoreId

  loginWCallback(test, onUserLoggedIn)
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
      test.isTrue(createdStorefront.userId !== expectedStorefront.userId)

      logoutWCallback(test, onLoggedOut)
    })
  }

  function onLoggedOut(error) {
    test.isUndefined(error, "Could not login user")
    Meteor.subscribe("mart/storefront", insertedStoreId, function() {
      let createdStorefront = Mart.Storefronts.findOne(insertedStoreId)
      test.isNotUndefined(createdStorefront)
      done()
    })
  }
})
