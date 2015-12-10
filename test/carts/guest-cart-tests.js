//TODO test collision avoidance if two guest carts have same guestId
Tinytest.addAsync('Carts - Guest - create & currentCart', function(test, done) {
  Mart.resetGuestId()
  testLogout(test, function() {
    Meteor.call("mart/cart/findCurrentOrCreate", Mart.guestId(), function(error, result) {
      Meteor.subscribe("mart/carts", [Mart.Cart.STATES.SHOPPING], Mart.guestId(), onSubscribed);
    });
  })

  function onSubscribed() {
    console.log(Mart.guestId());
    var cart = Mart.Cart.currentCart()

    test.isNotUndefined(cart)
    test.equal(Mart.Carts.find().count(), 1)

    done()
  }
})
