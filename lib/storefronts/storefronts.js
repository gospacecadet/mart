Mart.Storefronts = new Mongo.Collection("MartStorefronts");
Mart.Storefront = {}

Mart.Storefronts.attachSchema(new SimpleSchema({
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
  },
  userId: {
    type: String,
    autoValue: function() {
      return this.userId;
    }
  },
}))

Mart.Storefront.create = function(storefront, callback) {
  Mart.Storefronts.insert(storefront, callback)
}
