Mart.Images = new Mongo.Collection("MartImages");

Mart.Images.attachSchema(new SimpleSchema({
  objectId: {
    type: String,
    denyUpdate: true
  },
  objectCollection: {
    type: String,
    denyUpdate: true,
    allowedValues: ['Storefronts', 'Products']
  },
  originalUrl: {
    type: String,
    denyUpdate: true
  },
  thumbnailUrl: {
    type: String,
    denyUpdate: true
  },
  optimizedUrl: {
    type: String,
    denyUpdate: true
  },
  index: {
    type: Number,
  }
}));
