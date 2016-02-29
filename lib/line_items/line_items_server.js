Security.defineMethod("ifCartBelongsToCurrentUser", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    var cart = Mart.Carts.findOne({_id: doc.cartId, state: Mart.Cart.STATES.SHOPPING})
    if(cart) {
      if(!!userId) {
        return userId !== cart.userId
      } else {
        // TODO prevent not logged in users from adding to somebody else's cart
        return cart.guestId === undefined
      }
    }
    return true;
  }
});

Mart.LineItems.permit(['insert', 'update', 'remove'])
  .ifCartBelongsToCurrentUser()
  .apply();
