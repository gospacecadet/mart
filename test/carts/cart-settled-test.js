Tinytest.addAsync('Carts - Machina - SETTLED', function(test, done) {
  var cardId, shopperId,
      checkoutDetails = {
        contactName: "Marvin Arnold",
        contactEmail: "marvin@unplugged.im",
        contactPhone: "+13016864576",
        contactEntity: "yo mama",
      },
      bankAccount = {
        accountNumber: "000123456789",
        routingNumber: "110000000",
        recipientType: 'corporation',
        name: "Test Bank Account asf;ddsaf"
      },
      merchants = [{}, {}],
      i = 0
  // merchant1Id, storefront1Id, product1Id, merchant1ManagedAccountId, merchant1Email,
  //     price1 = randomPrice(),
  //     bankAccount1 = {
  //       accountNumber: "000123456789",
  //       routingNumber: "110000000",
  //       recipientType: 'corporation',
  //       name: "Test Bank Account asf;ddsaf"
  //     }

  // create merchants or start checking out
  begin()
  function begin() {
    if(i < 2) {
      testLogout(test, createMerchant)
    } else {
      testLogout(test, beginShopper)
    }
  }

  function createMerchant() {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, function(error, email) {
      merchants[i].email = email
      merchants[i]._id = Meteor.userId()
      createStorefronts()
    })
  }

  function createStorefronts() {
    Mart.Storefronts.insert({
      name: "testtest",
      description: "asasdfsadf dasfasdd",
      isPublished: true,
    }, function(error, storefrontId) {
      test.isUndefined(error, "Could not create storefront for merchant " + i)
      createProducts(error, storefrontId)
    })
  }

  function createProducts(error, storefrontId) {
    var price1 = randomPrice()
    var price2 = randomPrice()
    Mart.Products.insert({
      storefrontId: storefrontId,
      name: "asd;skdf sdf",
      description: "a;sldfjkas;dlf",
      unitPrice: price1,
      isPublished: true
    }, function(error, product1Id) {
      test.isUndefined(error, "could not create first product for merchant " + i)
      merchants[i].product1Id = product1Id

      Mart.Products.insert({
        storefrontId: storefrontId,
        name: "product 2",
        description: "a;sdfasd dsdfd;dlf",
        unitPrice: price2,
        isPublished: true
      }, function(error, product2Id) {
        test.isUndefined(error, "could not create second product for merchant " + i)
        merchants[i].product2Id = product2Id
        createBankAccount()
      })
    })
  }

  function createBankAccount() {
    Mart.createBankAccount('Stripe', bankAccount, function(err, bId) {
      test.isUndefined(err, 'Unexpected ERROR CREATING BANK ACCOUNT');
      merchants[i].bankAccountId = bId
      merchantFinished()
    })
  }

  function merchantFinished() {
    i++
    begin()
  }

  // Log shopper in
  function beginShopper() {
    testLogin([Mart.ROLES.GLOBAL.SHOPPER], test, function() {
      shopperId = Meteor.userId()
      createCard()
    })
  }

  // Create card for shopper
  function createCard() {
    var card = {
      nameOnCard: "Marvin Arnold",
      expMonth: 10,
      expYear: 2019,
      cvc: 123,
      number: 4242424242424242
    }

    Mart.Card.createCard("Stripe", card, function(error, result) {
      test.isUndefined(error, "Could not create credit card")
      addItemsToCart()
    })
  }

  function addItemsToCart() {
    Mart.LineItems.insert({
      productId: merchants[0].product1Id,
      quantity: 1,
    }, function(error, result) {
      test.isUndefined(error, "Could not add the first item to the cart")
      Mart.LineItems.insert({
        productId: merchants[1].product2Id,
        quantity: 2,
      }, finish)
    })
  }

  function finish() {
    // sub6.stop()
    // sub8.stop()
    // sub9.stop()
    // settledSub.stop()
    // prodSub.stop()
    // storeSub.stop()
    done()
  }


  //
  // var sub8
  // // 8 - Can add card of owner to cart
  // function submitCart(error, response) {
  //
  //   Meteor.call("mart/submit-cart", {
  //     CHECKOUT_DETAILS
  //   }, function(error, result) {
  //     test.isUndefined(error)
  //     sub8 = Meteor.subscribe("mart/carts",
  //       [Mart.Cart.STATES.WAITING_CART_ACCEPTANCE],
  //       Mart.guestId(), onSubmitCart)
  //   });
  // }
  //
  // // Ensure in correct state, correct values, and further updates not allowed
  // function onSubmitCart() {
  //   var cart = Mart.Carts.findOne(cartId)
  //   test.equal(cart.state, Mart.Cart.STATES.WAITING_CART_ACCEPTANCE)
  //   test.equal(cart.subtotal(), 2 * price)
  //   test.equal(cart.connectionFee, Math.floor(0.2 * cart.subtotal()))
  //   test.equal(cart.merchantCut, Math.ceil((1 - 0.2) * cart.subtotal()))
  //   test.equal(cart.connectionFee + cart.merchantCut, cart.subtotal())
  //
  //   test.equal(cart.serviceFee, Math.floor(0.3 * cart.subtotal()))
  //   test.equal(cart.preTaxTotal(), cart.subtotal() + cart.serviceFee)
  //
  //   test.equal(cart.tax, Math.floor(cart.preTaxTotal() * 0.1))
  //
  //   test.equal(cart.total(), cart.preTaxTotal() + cart.tax)
  //   testLogout(test, function() {
  //     Meteor.loginWithPassword(merchantEmail, 'traphouse', function() {
  //       makePayment()
  //     })
  //   })
  // }
  //
  // var sub9
  // function makePayment() {
  //   Meteor.call("mart/make-payment", cartId, function(error, result) {
  //     test.isUndefined(error)
  //
  //     // wait a few seconds for processing
  //     Meteor.setTimeout(function () {
  //       sub9 = Meteor.subscribe("mart/carts",
  //         [Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE],
  //         Mart.guestId(),
  //         onDonePayment)
  //     }, 2 * 1000);
  //   });
  // }
  //
  // var settledSub
  // function onDonePayment() {
  //   var cart = Mart.Carts.findOne(cartId)
  //   test.equal(cart.state, Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE)
  //   testIsRecent(cart.paymentAt, test)
  //   testIsRecent(cart.cartAcceptedAt, test)
  //   test.equal(typeof cart.paymentConfirmation, 'string')
  //   test.equal(cart.paymentAmount, cart.total())
  //
  //   testLogout(test, function() {
  //     testLogin([Mart.ROLES.GLOBAL.ADMIN], test, function() {
  //       Meteor.call("mart/process-transfer", cartId, function(error, result) {
  //         test.isUndefined(error)
  //
  //         Meteor.setTimeout(function () {
  //           settledSub = Meteor.subscribe("mart/carts",
  //             [Mart.Cart.STATES.SETTLED],
  //             shopperId,
  //             onDoneTransfer)
  //         }, 3 * 1000);
  //       });
  //     })
  //   })
  // }
  //
  // function onDoneTransfer() {
  //   var cart = Mart.Carts.findOne(cartId)
  //   test.isNotUndefined(cart)
  //   test.equal(cart.state, Mart.Cart.STATES.SETTLED)
  //   testIsRecent(cart.transferredAt, test)
  //   testIsRecent(cart.transferAcceptedAt, test)
  //   testIsRecent(cart.settledAt, test)
  //   test.equal(cart.transferAcceptedByAdminId, Meteor.userId())
  //   test.equal(typeof cart.transferConfirmation, 'string')
  //   test.equal(cart.transferAmount, cart.merchantCut)
  //   test.equal(typeof cart.transferredToManagedAccountId, 'string')
  //
  //   finish()
  // }
  //

})
