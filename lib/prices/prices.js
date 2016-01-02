Mart.Prices = new Mongo.Collection("MartPrices");

Mart.Prices.attachSchema(new SimpleSchema({
  productId: {
    type: String
  },
  unit: {
    type: String,
    allowedValues: ["hour", "day", "month"]
  }
}))
