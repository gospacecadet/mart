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
    denyUpdate: true
  },
  productId: {
    type: String,
    denyUpdate: true
  },
  quantity: {
    type: Number
  },
  productName: {
    type: String,
    autoValue: function() {
      if(this.isInsert) {
        var productId = this.field("productId").value
        var product = Mart.Products.findOne(productId)
        return product.name;
      }

      this.unset()
    },
    denyUpdate: true
  },
  storefrontName: {
    type: String,
    autoValue: function() {
      if(this.isInsert) {
        var productId = this.field("productId").value,
            product = Mart.Products.findOne(productId),
            storefront = Mart.Storefronts.findOne(product.storefrontId)
        return storefront.name;
      }
      this.unset()
    },
    // denyUpdate: true
  },
  unitPriceAtCheckout: {
    type: Number,
    autoValue: function() {
      if(this.isInsert) {
        var productId = this.field("productId").value
        var product = Mart.Products.findOne(productId)

        return product.unitPrice;
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
    // denyUpdate: true
  }
}));
