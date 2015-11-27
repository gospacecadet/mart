Mart.Carts = new Mongo.Collection("MartCarts");

Mart.Carts.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    autoValue: function() {
      return this.userId;
    }
  },
  isCurrent: {
    type: Boolean,
  }
}));
