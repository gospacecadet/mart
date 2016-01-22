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
  },
  thumbnailUrl: {
    type: String,
  },
  optimizedUrl: {
    type: String,
  },
  index: {
    type: Number,
    denyUpdate: true,
  }
}));
