// can only add to cart that belongs to current user and is in shopping state (default cart)
// can only add to product that is published [TODO: and belongs to published store]
if(Meteor.isClient) {
Tinytest.addAsync('LineItems - can be created by Shopper', function(test, done) {
  var productId, cartId, storefrontId

  testLogout(test, createProduct)

  var sub1
  function createProduct() {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, function() {
      Mart.Storefronts.insert({
        name: "testtest",
        description: "asasdfsadf dasfasdd",
        isPublished: true,
      }, function(error, sId) {
        storefrontId = sId
        sub1 = Meteor.subscribe("mart/storefront", storefrontId, function() {
          Mart.Products.insert({
            storefrontId: storefrontId,
            name: "asd;skdf sdf",
            description: "a;sldfjkas;dlf",
            unitPrice: 45.23,
            isPublished: true
          }, function(error, pId) {
            productId = pId
            begin()
          })
        })
      })
    })
  }

  var sub2
  function begin() {
    testLogout(test, function() {
      // Login as shopper
      testLogin([Mart.ROLES.GLOBAL.SHOPPER], test, function() {
        // Create current cart
        Meteor.call('mart/cart/findCurrentOrCreate', function(error, result) {
          sub2 = Meteor.subscribe("mart/carts", [Mart.Cart.STATES.SHOPPING], Mart.guestId(), function() {
            cartId = Mart.Cart.currentCartId()
            doTest()
          });
        });
      })
    })
  }

  function doTest() {
    Mart.LineItems.insert({
      productId: productId,
      cartId: cartId,
      quantity: 20,
    }, function(error, response) {
      test.isUndefined(error)

      sub1.stop()
      sub2.stop()
      done()
    })
  }
})

Tinytest.addAsync('LineItems - can be created by guest', function(test, done) {
  var productId, cartId, storefrontId

  testLogout(test, createProduct)

  var sub1
  function createProduct() {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, function() {
      Mart.Storefronts.insert({
        name: "testtest",
        description: "asasdfsadf dasfasdd",
        isPublished: true,
      }, function(error, sId) {
        storefrontId = sId
        sub1 = Meteor.subscribe("mart/storefront", storefrontId, function() {
          Mart.Products.insert({
            storefrontId: storefrontId,
            name: "asd;skdf sdf",
            description: "a;sldfjkas;dlf",
            unitPrice: 45.23,
            isPublished: true
          }, function(error, pId) {
            productId = pId
            begin()
          })
        })
      })
    })
  }

  var sub2
  function begin() {
    testLogout(test, function() {
      // Create current cart
      Meteor.call('mart/cart/findCurrentOrCreate', function(error, result) {
        sub2 = Meteor.subscribe("mart/carts", [Mart.Cart.STATES.SHOPPING], Mart.guestId(), function() {
          cartId = Mart.Cart.currentCartId()
          doTest()
        });
      });
    })
  }

  function doTest() {
    Mart.LineItems.insert({
      productId: productId,
      cartId: cartId,
      quantity: 20,
    }, function(error, response) {
      test.isUndefined(error)

      sub1.stop()
      sub2.stop()
      done()
    })
  }
})

}

if(Meteor.isServer) {
  var cartId = Mart.Carts.insert({userId: "testId"}, {validate: false}) // can't login users easily
  var cart = Mart.Carts.findOne(cartId)

  var storefrontId = Mart.Storefronts.insert({
    name: "Test Storefront",
    description: "A test storefront description",
    isActive: true,
    userId: "testId"
  }, {validate: false})
  var storefront = Mart.Storefronts.findOne(storefrontId)

  var productId = Mart.Products.insert({
    name: "test product",
    description: "a test description",
    unitPrice: 5.23,
    storefrontId: storefrontId,
    isPublished: true
  })

  Tinytest.add('LineItems - remove', function (test) {
    var lid = Mart.LineItems.insert({productId: productId, quantity: 2, cartId: cartId})
    var li = Mart.LineItems.findOne(lid)

    Mart.LineItem.remove(lid)

    test.isUndefined(Mart.LineItems.findOne(lid))
  })

  Tinytest.add('LineItems - sets CreatedAt', function (test) {
    var lid = Mart.LineItems.insert({productId: productId, quantity: 2, cartId: cartId})
    var li = Mart.LineItems.findOne(lid)
    var now = new Date().getTime()
    test.isTrue(li.createdAt > now - 100)
    test.isTrue(li.createdAt < now + 100)
  })

  Tinytest.add('LineItems - add product/shop attributes onCreate', function (test) {
    var lid = Mart.LineItems.insert({productId: productId, quantity: 2, cartId: cartId})
    var li = Mart.LineItems.findOne(lid)

    test.equal(li.unitPriceAtCheckout, 5.23)
    test.equal(li.productId, productId)
    test.equal(li.quantity, 2)
    test.equal(li.cartId, cartId)
    test.equal(li.productName, "test product")
    test.equal(li.storefrontName, "Test Storefront")
  })

  Tinytest.add('LineItems - has a subtotal', function (test) {
    var lid = Mart.LineItems.insert({productId: productId, quantity: 3, cartId: cartId})

    test.equal(Mart.LineItem.subtotal(lid), 5.23 * 3)
  })
}
