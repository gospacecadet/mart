Mart.LineItems = new Mongo.Collection("MartLineItems");
Mart.LineItem = {
  lineItem: function(lineItemId) {
    return Mart.LineItems.findOne(lineItemId)
  },
  subtotal: function(lineItemId) {
    var lineItem = this.lineItem(lineItemId)
    return lineItem.quantity * lineItem.unitPriceAtCheckout
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
      var productId = this.field("productId").value
      var product = Mart.Products.findOne(productId)
      return product.name;
    },
    denyUpdate: true
  },
  storefrontName: {
    type: String,
    autoValue: function() {
      var productId = this.field("productId").value,
          product = Mart.Products.findOne(productId),
          storefront = Mart.Storefronts.findOne(product.storefrontId)

      return storefront.name;
    },
    denyUpdate: true
  },
  unitPriceAtCheckout: {
    type: Number,
    decimal: true,
    autoValue: function() {
      var productId = this.field("productId").value
      var product = Mart.Products.findOne(productId)
      return product.unitPrice;
    },
    denyUpdate: true
  },
}));
