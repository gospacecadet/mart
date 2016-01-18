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

  var cartsCursor
  if(Mart._isAdmin(this.userId)) {

      cartsCursor = Mart.Carts.find()

  } else if(Mart._isRep(this.userId)) {

      var reppedStorefronts = Mart.Storefronts.find({
        repId: this.userId
      }).fetch()

      var reppedStorefrontIds = _.map(reppedStorefronts, function(storefront) {
        return storefront._id
      })

      cartsCursor = Mart.Carts.find({storefrontId: {$in: reppedStorefrontIds}})

  } else if(Mart._isShopper(this.userId)) {
      cartsCursor = Mart.Carts.find({
        $and: [
          {userId: this.userId},
          {state: {$in: states}}
        ]
      })
  }
  else if(Mart._isMerchant(this.userId)) {

      cartsCursor = Mart.Carts.find({merchantId: this.userId})

  } else { // guest
    cartsCursor = Mart.Carts.find({
      $and: [
        {guestId: guestId},
        {state: {$in: states}}
      ]
    })
  }

  cartHandle = cartsCursor.observeChanges({
    added: function(id, cart) {
      publishCartLineItems(id);
      sub.added('MartCarts', id, cart);
    },
    changed: function(id, fields) {
      sub.changed('MartCarts', id, fields);
    },
    removed: function(id) {
      // stop observing changes on the cart's line items
      lineItemHandles[id] && lineItemHandles[id].stop();
      // delete the cart
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
