Mart.LineItems = new Mongo.Collection("MartLineItems");

Mart.LineItems.attachSchema(new SimpleSchema({
  cartId: {
    type: String
  },
  productId: {
    type: String
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
    }
  },
  storefrontName: {
    type: String,
    autoValue: function() {
      var productId = this.field("productId").value,
          product = Mart.Products.findOne(productId),
          storefront = Mart.Storefronts.findOne(product.storefrontId)

      return storefront.name;
    }
  },
  unitPriceAtCheckout: {
    type: Number,
    decimal: true,
    autoValue: function() {
      var productId = this.field("productId").value
      var product = Mart.Products.findOne(productId)
      return product.unitPrice;
    }
  },
}));
