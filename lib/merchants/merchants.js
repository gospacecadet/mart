Mart.Merchants = new Mongo.Collection("mart-merchants");
Mart.Merchant = {}

Mart.Merchants.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: "Name",
    max: 50
  },
  description: {
    type: String,
    label: "Description",
    optional: true,
    max: 1000
  },
  isActive: {
    type: Boolean,
    label: "Station active?"
  },
  isDeleted: {
    type: Boolean,
    autoValue: function() {
      return false;
    }
  }
}))

Mart.Merchant.create = function(merchant, callback) {
  Mart.Merchants.insert(merchant, callback)
}
