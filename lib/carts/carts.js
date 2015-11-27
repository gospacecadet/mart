Mart.Carts = new Mongo.Collection("MartCarts");

_cartStates = [
  "current"
]

Mart.Carts.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    autoValue: function() {
      return this.userId;
    }
  },
  state: {
    type: String,
    autoValue: function() {
      return "current"
    }
  }
}));
