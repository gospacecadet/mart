Mart.Products = new Mongo.Collection("MartProducts");

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
  isPublished: {
    type: Boolean,
    label: "Ready to be published?",
  },
  isDeleted: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if(this.isInsert) {
        return new Date()
      }

      this.unset()
    },
  }
}));

Mart.Product = {
  UNITS: {
    HOUR: "hour",
    DAY: "day",
    MONTH: "month"
  },
  _UNITS: function() {
    return _.keys(_.invert(this.UNITS))
  }
}
