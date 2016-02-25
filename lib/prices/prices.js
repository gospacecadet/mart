Mart.Prices = new Mongo.Collection("MartPrices");

Mart.Prices.attachSchema(new SimpleSchema({
  productId: {
    type: String
  },
  unit: {
    type: String,
    allowedValues: Mart.Product._UNITS()
  },
  priceInCents: {
    type: Number
  },
  depositInCents: {
    type: Number,
    optional: true
  }
}))
