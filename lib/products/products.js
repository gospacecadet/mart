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
    max: 1000
  },
  isPublished: {
    type: Boolean,
    label: "Ready to be published?",
    autoValue: function() {
      // Should only be able to publish from server if several conditions are met
      this.unset()
      if(this.isInsert) {
        return false
      }
    }
  },
  isDeleted: {
    type: Boolean,
    autoValue: function() {
      // Should only be able to publish from server if several conditions are met
      this.unset()
      if(this.isInsert) {
        return false
      }
    }
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if(this.isInsert) {
        return new Date()
      }

      this.unset()
    },
  },
  occupancy: {
    type: Number,
    optional: true
  },
  size: {
    type: String,
    optional: true
  },
  lowestPriceCents: {
    type: Number,
    optional: true
  },
  lowestPriceUnit: {
    type: String,
    allowedValues: Mart.Product._UNITS(),
    optional: true
  }
}));
