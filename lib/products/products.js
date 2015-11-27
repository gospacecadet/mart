Mart.Products = new Mongo.Collection("MartProducts");
Mart.Product = {}

Mart.Products.attachSchema(new SimpleSchema({
  storefrontId: {
    type: String
  },
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
    label: "Ready to be published?"
  },
  isDeleted: {
    type: Boolean,
    autoValue: function() {
      return false;
    }
  }
}));