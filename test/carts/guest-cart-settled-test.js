Tinytest.addAsync('Carts - Machina - Guest SETTLED', function(test, done) {
  var cardTokens = [],
      shopperId,
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
      NUM_MERCHANTS = 2

  // create merchants or start checking out
  begin(0)
  function begin(index) {
    Mart.resetGuestId()
    if(index < NUM_MERCHANTS) {
      testLogout(test, function() {
        createMerchant(index)
      })
    } else {
      testLogout(test, beginShopper)
    }
  }

  function createMerchant(index) {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, function(error, email) {
      merchants[index].email = email
      merchants[index]._id = Meteor.userId()
      createStorefronts(index)
    })
  }

  // one storefront per merchant
  function createStorefronts(index) {
    Mart.Storefronts.insert({
      name: "testtest",
      description: "asasdfsadf dasfasdd",
      isPublished: true,
    }, function(error, storefrontId) {
      test.isUndefined(error, "Could not create storefront for merchant " + index)
      createProducts(error, storefrontId, index)
    })
  }

  // two products per storefront
  function createProducts(error, storefrontId, index) {
    merchants[index].product1Price = randomPrice()
    merchants[index].product2Price = randomPrice()

    Mart.Products.insert({
      storefrontId: storefrontId,
      name: "asd;skdf sdf",
      description: "a;sldfjkas;dlf",
      unitPrice: merchants[index].product1Price,
      isPublished: true
    }, function(error, product1Id) {
      test.isUndefined(error, "could not create first product for merchant " + index)
      merchants[index].product1Id = product1Id

      Mart.Products.insert({
        storefrontId: storefrontId,
        name: "product 2",
        description: "a;sdfasd dsdfd;dlf",
        unitPrice: merchants[index].product2Price,
        isPublished: true
      }, function(error, product2Id) {
        test.isUndefined(error, "could not create second product for merchant " + index)
        merchants[index].product2Id = product2Id
        createBankAccount(index)
      })
    })
  }

  function createBankAccount(index) {
    Mart.createBankAccount('Stripe', bankAccount, function(err, bId) {
      test.isUndefined(err, 'Unexpected ERROR CREATING BANK ACCOUNT');
      merchants[index].bankAccountId = bId
      merchantFinished(index)
    })
  }

  function merchantFinished(index) {
    index++
    begin(index)
  }

  // Log shopper in
  function beginShopper() {
    addItemsToCart()
  }

  function addItemsToCart() {
    Mart.LineItems.insert({
      productId: merchants[0].product2Id,
      quantity: 1,
      cartId: "required",
      guestId: Mart.guestId()
    }, function(error, result) {
      test.isUndefined(error, "Could not add the first item to the cart")
      Mart.LineItems.insert({
        productId: merchants[1].product2Id,
        quantity: 2,
        cartId: "required",
        guestId: Mart.guestId()
      }, getCarts)
    })
  }

  var cartsSub
  var card = {
    nameOnCard: "Marvin Arnold",
    expMonth: 10,
    expYear: 2019,
    cvc: 123,
    number: 4242424242424242
  }
  var carts
  function getCarts() {
    cartsSub = Meteor.subscribe("mart/carts",
      [Mart.Cart.STATES.SHOPPING],
      Mart.guestId(), function() {
        carts = Mart.Carts.find()
        createCard(0)
      })
  }

  // Create card for shopper
  function createCard(index) {
    if(index < carts.count()) {
      Mart.Card.createCard("Stripe", card, function(error, token) {
        test.isUndefined(error, "Could not create credit card")
        cardTokens.push(token)
        index++
        createCard(index)
      })
    } else {
      submitCarts()
    }
  }

  // Line items for different merchants create different carts
  // Submit both
  var waitingCartAcceptanceSub
  function submitCarts(error, response) {
    Meteor.call("mart/submit-carts", _.extend(checkoutDetails, {
      cardTokens: cardTokens,
      guestId: Mart.guestId()
    }), function(error, result) {
      test.isUndefined(error)
      waitingCartAcceptanceSub = Meteor.subscribe("mart/carts",
        [Mart.Cart.STATES.WAITING_CART_ACCEPTANCE],
        Mart.guestId(), checkCartsWaitingAcceptance)
    });
  }

  function checkCartsWaitingAcceptance() {
    test.equal(Mart.Carts.find().count(), NUM_MERCHANTS)
    checkCartWaitingAcceptance(0)
  }

  function checkCartWaitingAcceptance(index) {
    if(index < NUM_MERCHANTS) {
      var cart = Mart.Carts.findOne({merchantId: merchants[index]._id})
      merchants[index].cartId = cart._id
      test.equal(cart.state, Mart.Cart.STATES.WAITING_CART_ACCEPTANCE)
      test.equal(cart.subtotal(), (1+index) * merchants[index].product2Price, "Did not correctly calculate cart subtotal")
      test.equal(cart.connectionFee, Math.floor(0.2 * cart.subtotal()), "Bad connection fee")
      test.equal(cart.merchantCut, Math.ceil((1 - 0.2) * cart.subtotal()), "Bad merchant cut")
      test.equal(cart.connectionFee + cart.merchantCut, cart.subtotal(), "Connection fee + merchant cut = cart subtotal")

      test.equal(cart.serviceFee, Math.floor(0.3 * cart.subtotal()), "Bad service fee")
      test.equal(cart.preTaxTotal(), cart.subtotal() + cart.serviceFee, "Bad pretax total")

      test.equal(cart.tax, Math.floor(cart.preTaxTotal() * 0.1), "Bad tax amount")

      test.equal(cart.total(), cart.preTaxTotal() + cart.tax, "Bad total")

      index++
      checkCartWaitingAcceptance(index)
    } else {
      makePayments()
    }
  }

  function makePayments() {
    makePayment(0)
  }

  var waitingTransferAcceptance
  function makePayment(index) {
    if(index < NUM_MERCHANTS) {
      Meteor.loginWithPassword(merchants[index].email, 'traphouse', function() {
        Meteor.call("mart/make-payment", merchants[index].cartId, function(error, result) {
          test.isUndefined(error)

          // wait a few seconds for processing
          Meteor.setTimeout(function () {
            waitingTransferAcceptance = Meteor.subscribe("mart/carts",
              [Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE],
              Mart.guestId(),
              function() {
                checkCartWaitingTransferAcceptance(index)
              })
          }, 2 * 1000);
        })
      })
    } else {
      processTransfers()
    }

  }

  function checkCartWaitingTransferAcceptance(index) {
    var cart = Mart.Carts.findOne(merchants[index].cartId)
    test.equal(cart.state, Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE)
    testIsRecent(cart.paymentAt, test)
    testIsRecent(cart.cartAcceptedAt, test)
    test.equal(typeof cart.paymentConfirmation, 'string')
    test.equal(cart.paymentAmount, cart.total())

    testLogout(test, function() {
      index++
      makePayment(index)
    })
  }

  function processTransfers() {
    processTransfer(0)
  }

  function processTransfer(index) {
    if(index < NUM_MERCHANTS) {
      testLogout(test, function() {
        testLogin([Mart.ROLES.GLOBAL.ADMIN], test, function() {
          Meteor.call("mart/process-transfer", merchants[index].cartId, function(error, result) {
            test.isUndefined(error)

            Meteor.setTimeout(function () {
              settledSub = Meteor.subscribe("mart/carts",
                [Mart.Cart.STATES.SETTLED],
                shopperId,
                function() {
                  checkTransferResults(index)
                })
            }, 3 * 1000);
          });
        })
      })
    } else {
      finish()
    }
  }

  function checkTransferResults(index) {
    var cart = Mart.Carts.findOne(merchants[index].cartId)
    test.isNotUndefined(cart)
    test.equal(cart.state, Mart.Cart.STATES.SETTLED)
    testIsRecent(cart.transferredAt, test)
    testIsRecent(cart.transferAcceptedAt, test)
    testIsRecent(cart.settledAt, test)
    test.equal(cart.transferAcceptedByAdminId, Meteor.userId())
    test.equal(typeof cart.transferConfirmation, 'string')
    test.equal(cart.transferAmount, cart.merchantCut)
    test.equal(typeof cart.transferredToManagedAccountId, 'string')

    index++
    processTransfer(index)
  }

  function finish() {
    waitingCartAcceptanceSub.stop()
    waitingTransferAcceptance.stop()
    cartsSub.stop()
    done()
  }
})
