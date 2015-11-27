Handlebars.registerHelper("cart", function() {
  return Mart.Carts.findOne();
});

Handlebars.registerHelper("cartId", function() {
  var cart = Mart.Carts.findOne();
  if(cart)
    return cart._id;
  return undefined;
});


Meteor.startup(function () {
  console.log("Subscribing to cart");
  var userId = Meteor.userId()

  if(userId) {
    Meteor.call('mart/cart/findCurrentOrCreate')
    console.log("upserted to cart");
    Meteor.subscribe("mart/cart");
    console.log("Subscribed to cart");
  } else {
    // TODO create a local cart
  }
});
