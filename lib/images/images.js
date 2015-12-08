Mart.Images = new Mongo.Collection("MartImages");

Mart.Images.attachSchema(new SimpleSchema({
  objectId: {
    type: String,
    denyUpdate: true
  },
  objectType: {
    type: String,
    denyUpdate: true
  },
  url: {
    type: Number,
    denyUpdate: true
  },
  tags: {
    type: String,
  },
  createdAt: {
    type: Date,
    defaultValue: function() {
      return new Date()
    },
    denyUpdate: true
  }
}));
