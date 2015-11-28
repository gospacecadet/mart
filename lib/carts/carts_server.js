Meteor.publish('mart/cart', function(cartId) {
  check(cartId, String);
  if(this.userId){
    return Mart.Carts.find({_id: cartId})
  }
  this.ready();
})

Meteor.publish('mart/carts', function(states) {
  check(states, [String]);

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
          publishLineItemProductsAndStorefronts(id);
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

  function publishLineItemProductsAndStorefronts(lineItemId) {
    var lineItem = Mart.LineItems.findOne(lineItemId)

    var productsCursor = Mart.Products.find({_id: lineItem.productId})
    productHandles[lineItemId] =
      Mongo.Collection._publishCursor(productsCursor, sub, "MartProducts")

    var product = Mart.Products.findOne(lineItem.productId)
    var storefrontsCursor = Mart.Storefronts.find({_id: product.storefrontId})
      storefrontHandles[lineItemId] =
        Mongo.Collection._publishCursor(storefrontsCursor, sub, "MartStorefronts")
  }

  cartHandle = Mart.Carts.find({
    $and: [
      {userId: userId},
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

Meteor.methods({
  'mart/cart/findCurrentOrCreate': function() {
    userId = Meteor.userId()
    return Mart.Carts.update({
      state: Mart.Cart.STATES.SHOPPING,
      userId: userId
    }, {$set: {state: Mart.Cart.STATES.SHOPPING, userId: userId}},
    {validate: false, upsert: true})
  }
});

Security.defineMethod("inShoppingState", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    console.log("inShoppingState " + doc.state + "  " + userId + "   " + doc.userId)
    return doc.state !== Mart.Cart.STATES.SHOPPING || userId !== doc.userId
  }
});

Mart.Carts.permit(['insert', 'update', 'remove']).never().apply();
Mart.Carts.permit(['update'])
  .inShoppingState()
  // .onlyProps(['contactName', 'contactEmail', 'contactPhone', 'contactEntity'])
  .apply()
