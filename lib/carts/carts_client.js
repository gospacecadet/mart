_.extend(Mart.Cart, {
  currentCart: function() {
    var cart = {state: Mart.Cart.STATES.SHOPPING},
        userId = Meteor.userId()

    if(userId) {
      console.log('as user');
      _.extend(cart, {userId: userId})
    } else {
      _.extend(cart, {guestId: Mart.guestId()})
    }
    return Mart.Carts.findOne(cart)
  },
  currentCartId: function() {
    var that = this
    if(that.currentCart())
      return that.currentCart()._id

    return undefined
  },
})

Handlebars.registerHelper("cart", function() {
  return Mart.Cart.currentCart()
});

Handlebars.registerHelper("lineItems", function() {
  if(Mart.Cart.currentCartId())
    return Mart.Cart.lineItems(Mart.Cart.currentCartId());
  return []
});

Handlebars.registerHelper("cartId", function() {
  return Mart.Cart.currentCartId()
});

Handlebars.registerHelper("cartSubtotal", function() {
  if(Mart.Cart.currentCartId())
    return Mart.Cart.subtotal(Mart.Cart.currentCartId())
  return 0
});

Handlebars.registerHelper("cartSize", function() {
  if(Mart.Cart.currentCartId())
    return Mart.Cart.lineItems(Mart.Cart.currentCartId()).length
  return 0
});

Handlebars.registerHelper("cartHasItems", function() {
  return Mart.Cart.currentCartId() &&
    Mart.Cart.lineItems(Mart.Cart.currentCartId()).length > 0
});
