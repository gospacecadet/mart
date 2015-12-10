//TODO test collision avoidance if two guest carts have same guestId
Tinytest.addAsync('Carts - Guest - create & currentCart', function(test, done) {
  var sub
  Mart.resetGuestId() // should not be necessary if all subscriptions stopped
  testLogout(test, function() {
    Meteor.call("mart/cart/findCurrentOrCreate", Mart.guestId(), function(error, result) {
      sub = Meteor.subscribe("mart/carts", [Mart.Cart.STATES.SHOPPING], Mart.guestId(), onSubscribed);
    });
  })

  function onSubscribed() {
    var cart = Mart.Cart.currentCart()

    test.isNotUndefined(cart)
    test.equal(Mart.Carts.find().count(), 1)

    sub.stop()
    done()
  }
})
