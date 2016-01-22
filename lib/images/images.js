Mart.Images = new Mongo.Collection("MartImages");

Mart.Images.attachSchema(new SimpleSchema({
  objectId: {
    type: String,
  },
  objectCollection: {
    type: String,
    allowedValues: ['Storefronts', 'Products']
  },
  originalUrl: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  optimizedUrl: {
    type: String,
  },
  index: {
    type: Number,
  }
}));
