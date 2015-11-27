Handlebars.registerHelper("cart", function() {
  return Mart.Carts.findOne();
});

Handlebars.registerHelper("cartId", function() {
  var cart = Mart.Carts.findOne();
  if(cart)
    return cart._id;
  return undefined;
});

Handlebars.registerHelper("cartSize", function() {
  return Mart.LineItems.find().count()
});

Meteor.startup(function () {
  var userId = Meteor.userId()

  if(userId) {
    Meteor.call('mart/cart/findCurrentOrCreate')
    Meteor.subscribe("mart/cart");
  } else {
    // TODO create a local cart
  }
});
