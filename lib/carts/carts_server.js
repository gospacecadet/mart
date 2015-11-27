Meteor.publish('mart/cart', function() {
  var sub = this, lineItemHandles = [], cartHandle = null;

  // send over all line items for a specific cart
  function publishCartLineItems(cartId) {
    var lineItemsCursor = Mart.LineItems.find({cartId: cartId});
    lineItemHandles[cartId] =
      Mongo.Collection._publishCursor(lineItemsCursor, sub, 'MartLineItems');
  }

  cartHandle = Mart.Carts.find({ userId: userId, state: "current"}).observeChanges({
    added: function(id, cart) {
      publishCartLineItems(id);
      sub.added('MartCarts', id, cart);
    },
    changed: function(id, fields) {
      sub.changed('MartCarts', id, fields);
    },
    removed: function(id) {
      // stop observing changes on the post's comments
      lineItemHandles[id] && lineItemHandles[id].stop();
      // delete the post
      sub.removed('MartCarts', id);
    }
  });

  sub.ready();

  // make sure we clean everything up (note `_publishCursor`
  //   does this for us with the comment observers)
  sub.onStop(function() { cartHandle.stop(); });
});

Mart.Carts.permit(['insert', 'update', 'remove']).never().apply();

Meteor.methods({
  'mart/cart/findCurrentOrCreate': function() {
    userId = Meteor.userId()
    return Mart.Carts.upsert({state: "current", userId: userId}, {$set: {state: "current", userId: userId}})
  }
});
