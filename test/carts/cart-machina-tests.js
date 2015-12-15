// server
Tinytest.add('Carts - Machina - submitCart', function (test) {
  var cartId = Mart.Carts.insert({userId: "testId"}, {validate: false}) // can't login users easily
  var cart2Id = Mart.Carts.insert({userId: "testId"}, {validate: false}) // can't login users easily

  cart = Mart.Carts.findOne(cartId)
  cart.submitCart({
    serviceFeePct: 0.3,
    connectionFeePct: 0.2,
    taxPct: 0.1,
  })
  cart = Mart.Carts.findOne(cartId)
  cart2 =  Mart.Carts.findOne(cart2Id)

  test.equal(cart.state, Mart.Cart.STATES.WAITING_CART_ACCEPTANCE)
  test.isUndefined(cart2.state) // make sure state machine isn't global

  // Make sure state change only from SHOPPPING -> AUTHORIZING_PAYMENT
  cart.submitCart({
    serviceFeePct: 0.3,
    connectionFeePct: 0.2,
    taxPct: 0.1,
  })
  cart = Mart.Carts.findOne(cartId)
  test.equal(cart.state, Mart.Cart.STATES.WAITING_CART_ACCEPTANCE)
})

Tinytest.add('Carts - Machina - rejectCart', function (test) {
  var cartId = Mart.Carts.insert({userId: "testId", state: Mart.Cart.STATES.WAITING_CART_ACCEPTANCE}, {validate: false}) // can't login users easily
  cart = Mart.Carts.findOne(cartId)
  cart.rejectCart()
  cart = Mart.Carts.findOne(cartId)

  test.equal(cart.state, Mart.Cart.STATES.CANCELLED_BY_MERCHANT)
})

Tinytest.add('Carts - Machina - makePayment - success', function (test) {
  var cartId = Mart.Carts.insert({userId: "testId", state: Mart.Cart.STATES.WAITING_CART_ACCEPTANCE}, {validate: false}) // can't login users easily
  cart = Mart.Carts.findOne(cartId)
  cart.makePayment({secretKey: keys.secret})
  cart = Mart.Carts.findOne(cartId)

  test.equal(cart.state, Mart.Cart.STATES.MAKING_PAYMENT)
  // do stripe stuff and test
})
