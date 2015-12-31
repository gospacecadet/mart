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
    type: String,
    denyUpdate: true
  },
  thumbnailUrl: {
    type: String,
    denyUpdate: true
  },
  index: {
    type: Number,
  }
}));
