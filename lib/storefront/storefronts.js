Mart.Storefronts = new Mongo.Collection("MartStorefronts");
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
  isPublished: {
    type: Boolean,
    label: "Station published?"
  },
  isDeleted: {
    type: Boolean,
    defaultValue: false
  },
  userId: {
    type: String,
    autoValue: function() {
      return this.userId;
    },
    denyUpdate: true
  },
}))
