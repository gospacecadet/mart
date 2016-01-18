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
  connectionFee: function() {
    var connectionFeePct
    if(this._.unit === Mart.Product.UNITS.HOUR) {
      connectionFeePct = Mart.HOUR_CONNECTION_FEE_PCT
    } else if(this._.unit === Mart.Product.UNITS.DAY) {
      connectionFeePct = Mart.DAY_CONNECTION_FEE_PCT
    } else if(this._.unit === Mart.Product.UNITS.MONTH) {
      connectionFeePct = Mart.MONTH_CONNECTION_FEE_PCT
    } else {
      throw new Meteor.error('invalid-unit', "Invalid unit selected")
    }
    return this.subtotal() * connectionFeePct
  }
})

Mart.LineItems.after.remove(function(userId, doc) {
  var cart = Mart.Carts.findOne({_id: doc.cartId, state: Mart.Cart.STATES.SHOPPING})
  if(cart && cart.lineItems().length === 0)
    Mart.Carts.remove(cart._id)
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
          var cart = Mart.Carts.findOne({
            storefrontId: storefront._id,
            state: Mart.Cart.STATES.SHOPPING,
            userId: this.userId
          })

          if(cart)
            return cart._id

          var cartId = Mart.Carts.insert({
            storefrontId: storefront._id,
            merchantId: storefront.userId,
            state: Mart.Cart.STATES.SHOPPING,
            userId: this.userId
          })

          return cartId
        } else {
          var guestId = this.field("guestId").value
          // Find or create cart for guest
          if(!!guestId) {
            var cart = Mart.Carts.upsert({
              storefrontId: storefrontId,
              state: Mart.Cart.STATES.SHOPPING,
              guestId: guestId
            }, {$set: {
              storefrontId: storefront._id,
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
    allowedValues: Mart.Product._UNITS()
  },
  quantity: {
    type: Number
  },
  startAtDate: {
    type: Date
  },
  startAtHour: {
    type: Number
  },
  startAtMinute: {
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
  storefrontIdAtCheckout: {
    type: String,
    autoValue: function() {
      if(this.isInsert) {
        if(Meteor.isServer) { // In case not subscribed to product on client side
          var productId = this.field("productId").value
          return storefrontVal(productId, "_id")
        }
        return "Loading..."
      }
      this.unset()
    },
  },
  storefrontNameAtCheckout: {
    type: String,
    autoValue: function() {
      if(this.isInsert) {
        if(Meteor.isServer) { // In case not subscribed to product on client side
          var productId = this.field("productId").value
          return storefrontVal(productId, "name")
        }
        return "Loading..."
      }
      this.unset()
    },
  },
  addressAtCheckout: {
    type: String,
    autoValue: function() {
      if(this.isInsert) {
        if(Meteor.isServer) { // In case not subscribed to product on client side
          var productId = this.field("productId").value
          return storefrontVal(productId, "address")
        }
        return "Loading..."
      }
      this.unset()
    },
  },
  address2AtCheckout: {
    type: String,
    autoValue: function() {
      if(this.isInsert) {
        if(Meteor.isServer) { // In case not subscribed to product on client side
          var productId = this.field("productId").value
          return storefrontVal(productId, "address2")
        }
      }
      this.unset()
    },
    optional: true
  },
  cityAtCheckout: {
    type: String,
    autoValue: function() {
      if(this.isInsert) {
        if(Meteor.isServer) { // In case not subscribed to product on client side
          var productId = this.field("productId").value
          return storefrontVal(productId, "city")
        }
        return "Loading..."
      }
      this.unset()
    },
  },
  stateAtCheckout: {
    type: String,
    autoValue: function() {
      if(this.isInsert) {
        if(Meteor.isServer) { // In case not subscribed to product on client side
          var productId = this.field("productId").value
          return storefrontVal(productId, "state")
        }
        return "Loading..."
      }
      this.unset()
    },
  },
  zipAtCheckout: {
    type: String,
    autoValue: function() {
      if(this.isInsert) {
        if(Meteor.isServer) { // In case not subscribed to product on client side
          var productId = this.field("productId").value
          return storefrontVal(productId, "zip")
        }
        return "Loading..."
      }
      this.unset()
    },
  },
  unitPriceAtCheckout: {
    type: Number,
    autoValue: function() {
      if(this.isInsert) {
        if(Meteor.isServer) { // In case not subscribed to product on client side
          var productId = this.field("productId").value
          var unit = this.field("unit").value

          var price = Mart.Prices.findOne({productId: productId, unit: unit})

          return price.priceInCents;
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

var storefrontVal = function(productId, attrName) {
  var product = Mart.Products.findOne(productId)

  if(product) {
    storefront = Mart.Storefronts.findOne(product.storefrontId)
    return storefront[attrName];
  }
}
