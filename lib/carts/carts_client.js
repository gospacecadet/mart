Handlebars.registerHelper("cart", function() {
  return Mart.Carts.findOne();
});

Handlebars.registerHelper("lineItems", function() {
  return Mart.LineItems.find();
});

Handlebars.registerHelper("cartId", function() {
  return cartId();
});

var cartId = function() {
  var cart = Mart.Carts.findOne();
  if(cart)
    return cart._id;
  return undefined;
}

Handlebars.registerHelper("cartSubtotal", function() {
  return Mart.Cart.subtotal(cartId())
});

Handlebars.registerHelper("cartSize", function() {
  return Mart.LineItems.find().count()
});

Handlebars.registerHelper("cartHasItems", function() {
  return Mart.LineItems.find().count() > 0
});

Meteor.startup(function () {
  var userId = Meteor.userId()

  if(userId) {
    Meteor.call('mart/cart/findCurrentOrCreate')
    Meteor.subscribe("mart/cart", [Mart.Cart.STATES.SHOPPING]);
  } else {
    // TODO create a local cart
  }
});
