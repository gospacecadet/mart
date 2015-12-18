Tinytest.addAsync('Carts - successful checkout', function(test, done) {
  var cartId, cardId, productId, storefrontId, merchantBankAccountId,
      bankAccountId, shopperId, merchantManagedAccountId,
      contactDetails = {
        contactName: "Marvin Arnold",
        contactEmail: "marvin@unplugged.im",
        contactPhone: "+13016864576",
        contactEntity: "yo mama",
      },
      price = randomPrice(),
      bankAccount = {
        accountNumber: "000123456789",
        routingNumber: "110000000",
        recipientType: 'corporation',
        name: "Test Bank Account asf;ddsaf"
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

  function onStorefrontInserted(error, response) {
    storefrontId = response
    Mart.Products.insert({
      storefrontId: storefrontId,
      name: "asd;skdf sdf",
      description: "a;sldfjkas;dlf",
      unitPrice: price,
      isPublished: true
    }, onProductInserted)
  }

  function onProductInserted(error, result) {
    productId = result
    Mart.createBankAccount('Stripe', bankAccount, function(err, bId) {
      test.isUndefined(err, 'Unexpected ERROR CREATING BANK ACCOUNT');
      bankAccountId = bId
      testLogout(test, beginShopper)
    })
  }

  // create products
  function beginShopper() {
    // 2 - Login user
    testLogin([Mart.ROLES.GLOBAL.SHOPPER], test, onUserLoggedIn)
  }

  var prodSub, storeSub
  // 3 - Create default cart
  function onUserLoggedIn(err) {
    shopperId = Meteor.userId()
    test.isUndefined(err, 'Unexpected error logging in');
    prodSub = Meteor.subscribe("mart/product", productId, function() {
      storeSub = Meteor.subscribe("mart/storefront", storefrontId, function() {
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

    Mart.Card.createCard("Stripe", card, onCardCreated)
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
      serviceFeePct: 0.3,
      connectionFeePct: 0.2,
      taxPct: 0.1,
    },function(error, result) {
      test.isUndefined(error)
      sub8 = Meteor.subscribe("mart/carts",
        [Mart.Cart.STATES.WAITING_CART_ACCEPTANCE],
        Mart.guestId(), onSubmitCart)
    });
  }

  // Ensure in correct state, correct values, and further updates not allowed
  function onSubmitCart() {
    var cart = Mart.Carts.findOne(cartId)
    test.equal(cart.state, Mart.Cart.STATES.WAITING_CART_ACCEPTANCE)
    test.equal(cart.subtotal(), 2 * price)
    test.equal(cart.connectionFee, Math.floor(0.2 * cart.subtotal()))
    test.equal(cart.merchantCut, Math.ceil((1 - 0.2) * cart.subtotal()))
    test.equal(cart.connectionFee + cart.merchantCut, cart.subtotal())

    test.equal(cart.serviceFee, Math.floor(0.3 * cart.subtotal()))
    test.equal(cart.preTaxTotal(), cart.subtotal() + cart.serviceFee)

    test.equal(cart.tax, Math.floor(cart.preTaxTotal() * 0.1))

    test.equal(cart.total(), cart.preTaxTotal() + cart.tax)
    makePayment()
  }

  var sub9
  function makePayment() {
    Meteor.call("mart/make-payment", cartId, function(error, result) {
      test.isUndefined(error)

      // wait a few seconds for processing
      Meteor.setTimeout(function () {
        sub9 = Meteor.subscribe("mart/carts",
          [Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE],
          Mart.guestId(),
          onDonePayment)
      }, 2 * 1000);
    });
  }

  var settledSub
  function onDonePayment() {
    var cart = Mart.Carts.findOne(cartId)
    test.equal(cart.state, Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE)
    testIsRecent(cart.paymentAt, test)
    testIsRecent(cart.cartAcceptedAt, test)
    test.equal(typeof cart.paymentConfirmation, 'string')
    test.equal(cart.paymentAmount, cart.total())

    testLogout(test, function() {
      testLogin([Mart.ROLES.GLOBAL.ADMIN], test, function() {
        Meteor.call("mart/process-transfer", cartId, function(error, result) {
          test.isUndefined(error)

          Meteor.setTimeout(function () {
            settledSub = Meteor.subscribe("mart/carts",
              [Mart.Cart.STATES.SETTLED],
              shopperId,
              onDoneTransfer)
          }, 3 * 1000);
        });
      })
    })
  }

  function onDoneTransfer() {
    var cart = Mart.Carts.findOne(cartId)
    test.isNotUndefined(cart)
    test.equal(cart.state, Mart.Cart.STATES.SETTLED)
    testIsRecent(cart.transferredAt, test)
    testIsRecent(cart.transferAcceptedAt, test)
    testIsRecent(cart.settledAt, test)
    test.equal(cart.transferAcceptedByAdminId, Meteor.userId())
    test.equal(typeof cart.transferConfirmation, 'string')
    test.equal(cart.transferAmount, cart.merchantCut)
    test.equal(typeof transferredToManagedAccountId, 'string')

    finish()
  }

  function finish() {
    sub4.stop()
    sub6.stop()
    sub8.stop()
    sub9.stop()
    settledSub.stop()
    prodSub.stop()
    storeSub.stop()
    done()
  }
})
