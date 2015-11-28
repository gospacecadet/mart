Handlebars.registerHelper("cart", function() {
  return currentCart()
});

Handlebars.registerHelper("lineItems", function() {
  if(currentCartId())
    return Mart.Cart.lineItems(currentCartId());
  return []
});

Handlebars.registerHelper("cartId", function() {
  return currentCartId()
});

Handlebars.registerHelper("cartSubtotal", function() {
  if(currentCartId())
    return Mart.Cart.subtotal(currentCartId())
  return 0
});

Handlebars.registerHelper("cartSize", function() {
  if(currentCartId())
    return Mart.Cart.lineItems(currentCartId()).length
  return 0
});

Handlebars.registerHelper("cartHasItems", function() {
  return currentCartId() &&
    Mart.Cart.lineItems(currentCartId()).length > 0
});

var currentCart = function() {
  return Mart.Carts.findOne({
    userId: Meteor.userId(),
    state: Mart.Cart.STATES.SHOPPING
  })
}

var currentCartId = function() {
  if(currentCart())
    return currentCart()._id

  return undefined
}

Meteor.startup(function () {
  var userId = Meteor.userId()

  if(userId) {
    Meteor.call('mart/cart/findCurrentOrCreate')
    Meteor.subscribe("mart/carts", [Mart.Cart.STATES.SHOPPING]);
  } else {
    // TODO create a local cart
  }
});
