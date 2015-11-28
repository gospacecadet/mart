Handlebars.registerHelper("cart", function() {
  return Mart.Cart.currentCart()
});

Handlebars.registerHelper("lineItems", function() {
  return Mart.Cart.lineItems(Mart.Cart.currentCartId());
});

Handlebars.registerHelper("cartId", function() {
  return Mart.Cart.currentCartId()
});

Handlebars.registerHelper("cartSubtotal", function() {
  return Mart.Cart.subtotal(Mart.Cart.currentCartId())
});

Handlebars.registerHelper("cartSize", function() {
  return Mart.Cart.lineItems(Mart.Cart.currentCartId()).count()
});

Handlebars.registerHelper("cartHasItems", function() {
  return Mart.Cart.lineItems(Mart.Cart.currentCartId()).count() > 0
});

Meteor.startup(function () {
  var userId = Meteor.userId()

  if(userId) {
    Meteor.call('mart/cart/findCurrentOrCreate')
    Meteor.subscribe("mart/carts", [Mart.Cart.STATES.SHOPPING]);
  } else {
    // TODO create a local cart
  }
});
