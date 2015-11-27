if(Meteor.isServer) {
  var cartId = Mart.Carts.insert({userId: "testId"}, {validate: false}) // can't login users easily
  var cart = Mart.Carts.findOne(cartId)

  var storefrontId1 = Mart.Storefronts.insert({
    name: "Test Storefront",
    description: "A test storefront description",
    isActive: true,
    userId: "testId"
  }, {validate: false})

  var storefrontId2 = Mart.Storefronts.insert({
    name: "Test Storefront2",
    description: "A test storefront description2",
    isActive: true,
    userId: "testId2"
  }, {validate: false})

  var productId1 = Mart.Products.insert({
    name: "test product",
    description: "a test description",
    unitPrice: 5.23,
    storefrontId: storefrontId1,
    isActive: true
  })

  var productId2 = Mart.Products.insert({
    name: "test product2",
    description: "a test description2",
    unitPrice: 1098.92,
    storefrontId: storefrontId2,
    isActive: true
  })

  Tinytest.add('Cart - has a subtotal', function (test) {
    Mart.LineItems.insert({productId: productId1, quantity: 3, cartId: cartId})
    Mart.LineItems.insert({productId: productId2, quantity: 42, cartId: cartId})

    test.equal(Mart.Cart.subtotal(cartId), 5.23*3 + 42*1098.92)
  })
}
