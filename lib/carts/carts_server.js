Meteor.publish("mart/cart", function() {
  var cursors = new Array();
  var userId = this.userId
  var cartCursor = Mart.Carts.find({
    isCurrent: true,
    userId: userId,
  });
  cursors.push(cartCursor);

  var cart = cartCursor.fetch()[0]
  var lineItemsCuror = Mart.LineItems.find({cartId: cart._id})

  cursors.push(lineItemsCuror)
  return cursors
});

Mart.Carts.permit(['insert', 'update', 'remove']).never().apply();

Meteor.methods({
  'mart/cart/findCurrentOrCreate': function() {
    userId = Meteor.userId()
    console.log('mart/cart/findCurrentOrCreate ' + Meteor.userId())
    return Mart.Carts.upsert({isCurrent: true, userId: userId}, {$set: {isCurrent: true, userId: userId}})
  }
});
