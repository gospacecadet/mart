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
    isActive: true
  })
  var product = Mart.Products.findOne(productId)

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
}
