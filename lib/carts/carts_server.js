Meteor.methods({
  'mart/cart/findCurrentOrCreate': function(guestId) {
    check(guestId, Match.OneOf(String, null, undefined))

    var cartArgs = {state: Mart.Cart.STATES.SHOPPING},
        userId = Meteor.userId()

    if(userId) {
      _.extend(cartArgs, {userId: userId})
    } else {
      _.extend(cartArgs, {guestId: guestId})
    }

    // Hard ro return cartId if upsert
    var cart = Mart.Carts.findOne(cart)
    if(cart) {
      return cart._id
    } else {
      return Mart.Carts.insert(cartArgs, {validate: false})
    }
  }
});
