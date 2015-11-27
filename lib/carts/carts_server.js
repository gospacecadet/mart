Meteor.publish("mart/cart", function() {
  var cursors = new Array();
  var userId = this.userId

  // Publish cart
  var cartCursor = Mart.Carts.find({
    userId: userId,
    state: "current",
  });
  cursors.push(cartCursor);

  // Publish line items
  var cart = cartCursor.fetch()[0]
  var lineItemsCursor = Mart.LineItems.find({cartId: cart._id})
  cursors.push(lineItemsCursor)

  // Publish Products for Line Items
  var lineItems = lineItemsCursor.fetch();
  var productIds = _.map(lineItems, function(element, index, list) {
    return element.productId;
  });
  var productsCursor = Mart.Products.find({_id: {$in: productIds}})
  cursors.push(productsCursor)

  // Publish Storefronts for Products
  var products = productsCursor.fetch()
  var storefrontIds = _.map(products, function(element, index, list) {
    console.log("ONE PRODUCT " + element.storefrontId);
    return element.storefrontId;
  });
  var storefrontsCursor = Mart.Storefronts.find({_id: {$in: storefrontIds}})
  cursors.push(storefrontsCursor)

  return cursors
});

Mart.Carts.permit(['insert', 'update', 'remove']).never().apply();

Meteor.methods({
  'mart/cart/findCurrentOrCreate': function() {
    userId = Meteor.userId()
    return Mart.Carts.upsert({state: "current", userId: userId}, {$set: {state: "current", userId: userId}})
  }
});
