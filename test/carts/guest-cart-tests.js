//TODO test collision avoidance if two guest carts have same guestId
Tinytest.addAsync('Carts - Guest - create', function(test, done) {
  testLogout(test, function() {
    Meteor.call("mart/cart/findCurrentOrCreate", Mart.guestId(), function(error, result) {
      Meteor.subscribe("mart/carts", [Mart.Cart.STATES.SHOPPING], Mart.guestId(), onSubscribed);
    });
  })

  function onSubscribed() {
    var cart = Mart.Carts.findOne()

    test.isNotUndefined(cart)
    done()
  }
})
