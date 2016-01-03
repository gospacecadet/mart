// can only add to cart that belongs to current user and is in shopping state (default cart)
// can only add to product that is published [TODO: and belongs to published store]
Tinytest.addAsync('LineItems - can be created by Shoppers & Guests', function(test, done) {
  var productId, cartId, storefrontId

  testLogout(test, function() {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, function() {
      createTestStorefront({}, test, function(error, result) {
        storefrontId = result
        createTestProduct({storefrontId: storefrontId}, test, function(error, result) {
          productId = result
          begin()
        })
      })
    })
  })

  function begin() {
    testLogout(test, function() {
      testLogin([Mart.ROLES.GLOBAL.SHOPPER], test, function() {
        doShopperTest()
      })
    })
  }

  function doShopperTest() {
    console.log(productId);
    console.log(storefrontId);
    Mart.LineItems.insert({
      productId: productId,
      quantity: 20,
      unit: Mart.Product.UNITS.MONTH,
      cartId: "required-for-autovalue"
    }, function(error, lineId) {
      testError(error, test)
      var cartSub = Meteor.subscribe("mart/carts", [Mart.Cart.STATES.SHOPPING], Mart.guestId(), function() {
        var lineItem = Mart.LineItems.findOne(lineId)

        test.isNotUndefined(lineItem)
        done()
        // testIsRecent(lineItem.createdAt, test)
        // test.equal(lineItem.unitPriceAtCheckout, 4523)
        // test.equal(lineItem.productId, productId)
        // test.equal(lineItem.quantity, 20)
        // test.equal(typeof lineItem.cartId, "string")
        // test.equal(lineItem.productNameAtCheckout, "asd;skdf sdf")
        // test.equal(lineItem.storefrontNameAtCheckout, "testtest")
        // test.equal(lineItem.subtotal(), 4523 * 20)
        //
        // cartSub.stop()
        // testLogout(test, doGuestTest)
      })
    })
  }

  function doGuestTest() {
    Mart.LineItems.insert({
      productId: productId,
      quantity: 13,
      cartId: "required-for-autovalue",
      guestId: Mart.guestId()
    }, function(error, lineId) {
      test.isUndefined(error)
      var cartSub = Meteor.subscribe("mart/carts", [Mart.Cart.STATES.SHOPPING], Mart.guestId(), function() {
        var lineItem = Mart.LineItems.findOne(lineId)

        test.isNotUndefined(lineItem)
        testIsRecent(lineItem.createdAt, test)
        test.equal(lineItem.unitPriceAtCheckout, 4523)
        test.equal(lineItem.productId, productId)
        test.equal(lineItem.quantity, 13)
        test.equal(typeof lineItem.cartId, "string")
        test.equal(lineItem.productNameAtCheckout, "asd;skdf sdf")
        test.equal(lineItem.storefrontNameAtCheckout, "testtest")
        test.equal(lineItem.subtotal(), 4523 * 13)

        cartSub.stop()
        done()
      })
    })
  }
})
