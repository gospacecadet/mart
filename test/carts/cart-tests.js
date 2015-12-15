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
      unitPrice: 523,
      storefrontId: storefrontId1,
      isActive: true
    })

    var productId2 = Mart.Products.insert({
      name: "test product2",
      description: "a test description2",
      unitPrice: 109892,
      storefrontId: storefrontId2,
      isActive: true
    })

    Mart.LineItems.insert({productId: productId1, quantity: 3, cartId: cartId})
    Mart.LineItems.insert({productId: productId2, quantity: 42, cartId: cartId})

    test.equal(Mart.Carts.findOne(cartId).subtotal(), 523*3 + 42*109892)
  })
}

if(Meteor.isClient){
  Tinytest.addAsync('Carts - successful checkout', function(test, done) {
    var cartId, cardId, productId, storefrontId,
        contactDetails = {
          contactName: "Marvin Arnold",
          contactEmail: "marvin@unplugged.im",
          contactPhone: "+13016864576",
          contactEntity: "yo mama",
        }

    testLogout(test, beginMerchant)

    function beginMerchant() {
      testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, onLogin)
    }

    function onLogin() {
      Mart.Storefronts.insert({
        name: "testtest",
        description: "asasdfsadf dasfasdd",
        isPublished: true,
      }, onStorefrontInserted)
    }

    var prodSub
    function onStorefrontInserted(error, response) {
      storefrontId = response
      Mart.Products.insert({
        storefrontId: storefrontId,
        name: "asd;skdf sdf",
        description: "a;sldfjkas;dlf",
        unitPrice: 4523,
        isPublished: true
      }, onProductInserted)
    }

    function onProductInserted(error, result) {
      console.log('onProductInserted '+result);
      productId = result
      testLogout(test, beginShopper)
    }

    // create products
    function beginShopper() {
      // 2 - Login user
      testLogin([Mart.ROLES.GLOBAL.SHOPPER], test, onUserLoggedIn)
    }

    // 3 - Create default cart
    function onUserLoggedIn(err) {
      test.isUndefined(err, 'Unexpected error logging in');
      Meteor.subscribe("mart/product", productId, function() {
        Meteor.subscribe("mart/storefront", storefrontId, function() {
          Meteor.call('mart/cart/findCurrentOrCreate', onCartCreated)
        });
      });
    }

    var sub4
    // 4 - Subscribe to default cart
    function onCartCreated(error, result) {
      test.isUndefined(error, 'Could not create default cart');
      cartId = result
      sub4 = Meteor.subscribe("mart/carts", [
        Mart.Cart.STATES.SHOPPING
      ], Mart.guestId(), onCartReady);
    }

    // 5 - Create card for logged in user
    function onCartReady() {
      test.equal(Mart.Carts.find().count(), 1)
      var cart = Mart.Carts.findOne(cartId)
      test.isNotUndefined(cart, 'Expected there to be a default cart');
      test.equal(cart.state, Mart.Cart.STATES.SHOPPING)

      var card = {
        nameOnCard: "Marvin Arnold",
        expMonth: 10,
        expYear: 2019,
        cvc: 123,
        number: 4242424242424242
      }

      Mart.Card.createCard("Stripe", card, {
        publicKey: keys.public,
        secretKey: keys.secret,
      }, onCardCreated)
    }

    var sub6
    // 6 - Try to update cart with bad card
    function onCardCreated(error, result) {
      sub6 = Meteor.subscribe("mart/cards", Mart.guestId(), function() {
        test.isUndefined(error, 'Could not create a card for user');
        cardId = result
        var card = Mart.Cards.findOne(cardId)
        test.isNotUndefined(card);

        Mart.Carts.update(cartId, {$set:
          _.extend(contactDetails, {
            cardId: cardId
          }
        )}, addItemsToCart)
      });
    }

    function addItemsToCart(error, response) {
      test.isUndefined(error, 'Could not update cart with good card');
      console.log('productId ' + productId);
      console.log('cartId ' + cartId);
      Mart.LineItems.insert({
        productId: productId,
        cartId: cartId,
        quantity: 2,
      }, onCartUpdate)
    }

    var sub8
    // 8 - Can add card of owner to cart
    function onCartUpdate(error, response) {
      var updatedCart = Mart.Carts.findOne(cartId)
      test.equal(updatedCart.state, Mart.Cart.STATES.SHOPPING)
      test.equal(updatedCart.cardId, cardId)
      test.equal(updatedCart.contactName, contactDetails.contactName)
      test.equal(updatedCart.contactEmail, contactDetails.contactEmail)
      test.equal(updatedCart.contactPhone, contactDetails.contactPhone)
      test.equal(updatedCart.contactEntity, contactDetails.contactEntity)

      Meteor.call("mart/submit-cart", cartId, {
        serviceFeePct: 0.1,
        connectionFeePct: 0.1,
        taxPct: 0.1,
        merchantCut: 0.5
      },function(error, result) {
        test.isUndefined(error)
        sub8 = Meteor.subscribe("mart/carts",
          [Mart.Cart.STATES.WAITING_CART_ACCEPTANCE],
          Mart.guestId(), onSubmitCart)
      });
    }

    // Ensure in correct state and further updates not allowed
    function onSubmitCart() {
      var cart = Mart.Carts.findOne(cartId)
      test.equal(cart.state, Mart.Cart.STATES.WAITING_CART_ACCEPTANCE)
      test.equal(cart.subtotal(), 2 * 4523)
      test.equal(cart.total(), 1)
      test.equal(cart.serviceFee, 1)
      test.equal(cart.connectionFee, 1)
      test.equal(cart.tax, 1)
      test.equal(cart.merchantCut, 1)

      Mart.Carts.update(cartId, {$set:
        _.extend(contactDetails, {
          cardId: cardId
        }
      )}, onCartReupdate)
    }

    var sub9
    function onCartReupdate(error, result) {
      test.isNotUndefined(error)
      Meteor.call("mart/make-payment", cartId, function(error, result){
        test.isUndefined(error)

        // wait a few seconds for processing
        Meteor.setTimeout(function () {
          sub9 = Meteor.subscribe("mart/carts",
            [Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE],
            Mart.guestId(), onMakePayment)
        }, 3 * 1000);

      });
    }

    function onMakePayment() {
      var cart = Mart.Carts.findOne(cartId)
      // test.equal(cart.state, Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE)
      // test.equal(cart.paymentOn, )
      // test.equal(cart.paymentConfirmation, )
      // test.equal(cart.paymentAmount, )


      finish()
    }

    function finish() {
      sub4.stop()
      sub6.stop()
      sub8.stop()
      sub9.stop()
      done()
    }
  })
}
