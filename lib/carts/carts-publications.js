Meteor.publish('mart/cart', function(cartId) {
  check(cartId, String);
  if(this.userId) {
    return Mart.Carts.find({_id: cartId})
  }
  this.ready();
})

Meteor.publish('mart/carts', function(states, guestId) {
  check(states, [String]);
  check(guestId, Match.OneOf(String, null, undefined))

  var sub = this, productHandles = [], lineItemHandles = [], storefrontHandles = [],
      cartHandle = null, lineItemHandle = null;
  var userId = this.userId

  // send over all line items for a specific cart
  function publishCartLineItems(cartId) {
    var lineItemsCursor = Mart.LineItems.find({cartId: cartId})

    lineItemHandles[cartId] =
      Mongo.Collection._publishCursor(lineItemsCursor, sub, 'MartLineItems');

    lineItemHandle = Mart.LineItems.find({cartId: cartId}).observeChanges({
      added: function(id, lineItem) {
        publishLineItemProductsAndStorefronts(lineItem);
        sub.added('MartLineItems', id, lineItem)
      },
      changed: function(id, fields) {
        sub.changed('MartLineItems', id, fields)
      },
      removed: function(id) {
        productHandles[id] && productHandles[id].stop();
        storefrontHandles[id] && storefrontHandles[id].stop();
        // delete the post
        sub.removed('MartLineItems', id);
      }
    });
  }

  function publishLineItemProductsAndStorefronts(lineItem) {
    // var lineItem = Mart.LineItems.findOne(lineItemId)
    var lineItemId = lineItem._id

    var productsCursor = Mart.Products.find({_id: lineItem.productId})
    productHandles[lineItemId] =
      Mongo.Collection._publishCursor(productsCursor, sub, "MartProducts")

    var product = Mart.Products.findOne(lineItem.productId)
    var storefrontsCursor = Mart.Storefronts.find({_id: product.storefrontId})
      storefrontHandles[lineItemId] =
        Mongo.Collection._publishCursor(storefrontsCursor, sub, "MartStorefronts")
  }

  var userFilter
  if(!!userId) {
    userFilter = {userId: userId}
  } else {
    userFilter = {guestId: guestId}
  }

  cartHandle = Mart.Carts.find({
    $and: [
      userFilter,
      {state: {$in: states}}
    ]
  }).observeChanges({
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
  sub.onStop(function() {
    cartHandle.stop();
    if(lineItemHandle)
      lineItemHandle.stop();
  });
});
