Mart.LineItems = new Mongo.Collection("MartLineItems", {
  transform: function (doc) { return new LineItem(doc); }
});

var LineItem = function(doc) {
  _.extend(this, doc)
}

_.extend(LineItem.prototype, {
  subtotal: function() {
    return this.quantity * this.unitPriceAtCheckout
  },
})

Mart.LineItem = {
  lineItem: function(lineItemId) {
    return Mart.LineItems.findOne(lineItemId)
  },
  remove: function(lineItemId) {
    return Mart.LineItems.remove(lineItemId)
  }
}

Mart.LineItems.attachSchema(new SimpleSchema({
  cartId: {
    type: String,
    denyUpdate: true,
    autoValue: function() {

      if(Meteor.isServer) {
        var productId = this.field("productId").value
        var product = Mart.Products.findOne(productId)
        var storefront = Mart.Storefronts.findOne(product.storefrontId)

        // If user logged in, find or create cart for this shopper and
        // the merchant the product belongs to
        if(!!this.userId) {
          var cart = Mart.Carts.upsert({
            merchantId: storefront.userId,
            state: Mart.Cart.STATES.SHOPPING,
            userId: this.userId
          }, {$set: {
            merchantId: storefront.userId,
            state: Mart.Cart.STATES.SHOPPING,
            userId: this.userId
          }})

          return cart.insertedId
        } else {
          var guestId = this.field("guestId").value
          // Find or create cart for guest
          if(!!guestId) {
            var cart = Mart.Carts.upsert({
              merchantId: storefront.userId,
              state: Mart.Cart.STATES.SHOPPING,
              guestId: guestId
            }, {$set: {
              merchantId: storefront.userId,
              state: Mart.Cart.STATES.SHOPPING,
              guestId: guestId
            }})
            return cart.insertedId
          } else {
            // No user or guest to associate to
            return undefined
          }
        }
      }
    }
  },
  guestId: {
    type: String,
    optional: true
  },
  productId: {
    type: String,
    denyUpdate: true
  },
  unit: {
    type: String,
    allowedValues: []
  },
  quantity: {
    type: Number
  },
  productNameAtCheckout: {
    type: String,
    autoValue: function() {

      if(this.isInsert) {
        if(Meteor.isServer){
          var productId = this.field("productId").value
          var product = Mart.Products.findOne(productId)
          return product.name;
        }
        return "Loading..."
      }

      this.unset()
    },
    denyUpdate: true
  },
  storefrontNameAtCheckout: {
    type: String,
    autoValue: function() {
      if(this.isInsert) {
        if(Meteor.isServer) { // In case not subscribed to product on client side
          var productId = this.field("productId").value,
              product = Mart.Products.findOne(productId),
              storefront = Mart.Storefronts.findOne(product.storefrontId)
          return storefront.name;
        }
        return "Loading..."
      }
      this.unset()
    },
    // denyUpdate: true
  },
  unitPriceAtCheckout: {
    type: Number,
    autoValue: function() {
      if(this.isInsert) {
        if(Meteor.isServer) { // In case not subscribed to product on client side
          var productId = this.field("productId").value
          var product = Mart.Products.findOne(productId)

          return product.unitPrice;
        }
        return 0
      }
      this.unset()
    },
    // denyUpdate: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if(this.isInsert) {
        return new Date()
      }
      this.unset()
    },
    denyUpdate: true
  }
}));
