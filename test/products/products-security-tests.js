// Products
  // Security
    // - [Merchant] can [insert, update]
    // - [Admin] can [insert, update]
    // - [Rep] can [insert, update]

Tinytest.addAsync('Products - Security - [Merchant] can [insert, update]', function(test, done) {
  var storefrontId, productId

  testLogout(test, begin)

  function begin() {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, onLogin)
  }

  function onLogin() {
    Mart.Storefronts.insert({
      name: "testtest",
      description: "asasdfsadf dasfasdd",
      isPublished: true,
    }, onStorefrontInserted)
  }

  function onStorefrontInserted(error, response) {
    storefrontId = response
    Mart.Products.insert({
      storefrontId: storefrontId,
      name: "asd;skdf sdf",
      description: "a;sldfjkas;dlf",
      unitPrice: 45.23,
      isPublished: false
    }, onProductInserted)
  }

  function onProductInserted(error, response) {
    productId = response
    test.isUndefined(error)
    Meteor.subscribe('mart/storefront', storefrontId, function() {
      var product = Mart.Products.findOne(productId)
      test.equal(product.name, "asd;skdf sdf")
      test.equal(product.description, "a;sldfjkas;dlf")
      test.equal(product.unitPrice, 45.23),
      test.isFalse(product.isPublished)
      test.isFalse(product.isDeleted)

      Mart.Products.update(productId, {$set: {name: "hotness"}}, onUpdate)
    })
  }

  function onUpdate(error, response) {
    Meteor.subscribe('mart/storefront', storefrontId, function() {
      var product = Mart.Products.findOne(productId)
      test.equal(product.name, "hotness")

      Mart.Products.remove(productId, function(error, response) {
        test.isNotUndefined(error) // should not be allowed to delete

        done()
      })
    })
  }
})

_.each([Mart.ROLES.GLOBAL.REP, Mart.ROLES.GLOBAL.ADMIN], function(role) {
Tinytest.addAsync('Products - Security - [' + role + '] can [insert, update]', function(test, done) {
  var storefrontId, productId

  testLogout(test, begin)

  function begin() {
    testLogin([role], test, onLogin)
  }

  function onLogin() {
    Mart.Storefronts.insert({
      name: "testtest",
      description: "asasdfsadf dasfasdd",
      isPublished: true,
      userId: "fakeId"
    }, onStorefrontInserted)
  }

  function onStorefrontInserted(error, response) {
    test.isUndefined(error)
    storefrontId = response
    Mart.Products.insert({
      storefrontId: storefrontId,
      name: "asd;skdf sdf",
      description: "a;sldfjkas;dlf",
      unitPrice: 45.23,
      isPublished: false
    }, onProductInserted)
  }

  function onProductInserted(error, response) {
    productId = response
    test.isUndefined(error)
    Meteor.subscribe('mart/storefront', storefrontId, function() {
      var product = Mart.Products.findOne(productId)
      test.equal(product.name, "asd;skdf sdf")
      test.equal(product.description, "a;sldfjkas;dlf")
      test.equal(product.unitPrice, 45.23),
      test.isFalse(product.isPublished)
      test.isFalse(product.isDeleted)

      Mart.Products.update(productId, {$set: {name: "hotness"}}, onUpdate)
    })
  }

  function onUpdate(error, response) {
    Meteor.subscribe('mart/storefront', storefrontId, function() {
      var product = Mart.Products.findOne(productId)
      test.equal(product.name, "hotness")

      done()
    })
  }
})
})
