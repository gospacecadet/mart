if(Meteor.isServer) {
  Tinytest.add('Carts - has a subtotal', function (test) {
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


if(Meteor.isServer) {
  // 1 - Create card that doesnt belong to user
  var badCardId = Mart.Cards.insert({}, {validate: false})
}

if(Meteor.isClient){
  Tinytest.addAsync('Carts - successful checkout', function(test, done) {
    var originalCart, goodCardId,
        contactDetails = {
          contactName: "Marvin Arnold",
          contactEmail: "marvin@unplugged.im",
          contactPhone: "+13016864576",
          contactEntity: "yo mama",
          state: Mart.Cart.STATES.AWAITING_PAYMENT
        }

    testLogout(test, begin)
    function begin() {
      // 2 - Login user
      testLogin([Mart.ROLES.GLOBAL.SHOPPER], test, onUserLoggedIn)
    }

    // 3 - Create default cart
    function onUserLoggedIn(err) {
      test.isUndefined(err, 'Unexpected error logging in');
      done()
      // Meteor.call('mart/cart/findCurrentOrCreate', onCartCreated)
    }

    var sub4
    // 4 - Subscribe to default cart
    function onCartCreated(error, result) {
      test.isUndefined(error, 'Could not create default cart');
      sub4 = Meteor.subscribe("mart/carts", [
        Mart.Cart.STATES.SHOPPING,
        Mart.Cart.STATES.AWAITING_PAYMENT
      ], guestId(), onCartReady);
    }

    // 5 - Create card for logged in user
    function onCartReady() {
      originalCart = Mart.Carts.findOne()
      test.isTrue(originalCart !== undefined, 'Expected there to be a default cart');

      var card = {
        last4: 1234,
        expMonth: 11,
        expYear: 2019,
        nameOnCard: "Marvin Arnold",
        brand: "Visa",
        gatewayToken: "testToken",
        gateway: "Test"
      }

      Mart.Cards.insert(card, onCardCreated)
    }

    // 6 - Try to update cart with bad card
    function onCardCreated(error, result) {
      test.isUndefined(error, 'Could not create a card for user');
      goodCardId = result
      var goodCard = Mart.Cards.findOne(goodCardId)
      test.isTrue(goodCard.userId !== undefined, 'Good card did not have its userId set correctly');

      Mart.Carts.update(originalCart._id, {$set:
        _.extend(contactDetails, {
          cardId: badCardId
        }
      )}, onBadCardUpdate)

    }

    // 7 - Verify can't add cart to card unless common owner
    function onBadCardUpdate(error, response) {
      test.isTrue(error !== undefined, 'Expected there to be an error w/ bad card');

      Mart.Carts.update(originalCart._id, {$set:
        _.extend(contactDetails, {
          cardId: goodCardId
        }
      )}, onGoodCardUpdate)
    }

    // 8 - Can add card of common owner
    function onGoodCardUpdate(error, response) {
      test.isUndefined(error, 'Could not update cart with good card');

      var updatedCart = Mart.Carts.findOne(originalCart._id)
      test.equal(updatedCart.state, Mart.Cart.STATES.AWAITING_PAYMENT)
      test.equal(updatedCart.cardId, goodCardId)
      test.equal(updatedCart.contactName, contactDetails.contactName)
      test.equal(updatedCart.contactEmail, contactDetails.contactEmail)
      test.equal(updatedCart.contactPhone, contactDetails.contactPhone)
      test.equal(updatedCart.contactEntity, contactDetails.contactEntity)

      Meteor.call('mart/cart/findCurrentOrCreate', onNextCartCreated)
    }

    function onNextCartCreated(error, result) {
      var finalCart = Mart.Carts.findOne({state: Mart.Cart.STATES.SHOPPING})
      test.isFalse(finalCart._id === originalCart._id)

      sub4.stop()
      done();
    }
  })
}
