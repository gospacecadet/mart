Security.defineMethod("ifCartBelongsToCurrentUser", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    var cart = Mart.Carts.findOne({_id: doc.cartId, isCurrent: true})
    if(cart) {
      return userId !== cart.userId
    }
    return true;
  }
});

Mart.LineItems.permit(['insert', 'update', 'remove']).never().apply();
Mart.LineItems.permit(['insert', 'update'])
  .ifCartBelongsToCurrentUser()
  .apply();
