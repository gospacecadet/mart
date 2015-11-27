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
  }
}));
