if(Meteor.isServer) {
  Tinytest.add('Cart - has a subtotal', function (test) {
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
    
    Mart.LineItems.insert({productId: productId1, quantity: 3, cartId: cartId})
    Mart.LineItems.insert({productId: productId2, quantity: 42, cartId: cartId})

    test.equal(Mart.Cart.subtotal(cartId), 5.23*3 + 42*1098.92)
  })
}

// Can't test without login
// if(Meteor.isClient) {
//   testAsyncMulti('Carts - update contact info', [
//     function(test, expect) {
//       var cartId = Mart.Carts.insert({userId: "testId"}, {validate: false}) // can't login users easily
//       Mart.Carts.update(cartId, {$set: {
//         state: "failure",
//         userId: "failure",
//         contactName: "contactName",
//         contactEmail: "contactEmail",
//         contactPhone: "contactPhone",
//         contactEntity: "contactEntity",
//       }}, expect(function(err, response) {
//         if(err)
//           return test.isTrue(false, "Encountered error when trying to update: " + err.message)
//
//         var cart = Mart.Carts.findOne(cartId)
//         test.equal(cart.state, "contactName")
//         test.equal(cart.userId, "testId")
//         test.equal(cart.contactName, "contactName")
//         test.equal(cart.contactEmail, "contactEmail")
//         test.equal(cart.contactPhone, "contactPhone")
//         test.equal(cart.contactEntity, "contactEntity")
//       }))
//     }
//   ])
// }
