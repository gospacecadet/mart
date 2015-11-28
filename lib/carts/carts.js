Mart.Carts = new Mongo.Collection("MartCarts");
Mart.Cart = {
  cart: function(cartId) {
    return Mart.Cart.findOne(cartId)
  },
  lineItems: function(cartId) {
    return Mart.LineItems.find({cartId: cartId}).fetch()
  },
  subtotal: function(cartId) {
    return _.reduce(this.lineItems(cartId), function(sum, lineItem) {
      return sum + Mart.LineItem.subtotal(lineItem._id)
    }, 0)
  },
  STATES: {
    SHOPPING: "mart-cart-state-shopping"
  }
}

_cartStates = [
  Mart.Cart.STATES.SHOPPING
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
      return Mart.Cart.STATES.SHOPPING
    }
  },
  contactName: {
    type: String,
  },
  contactEmail: {
    type: String,
  },
  contactPhone: {
    type: String,
  },
  contactEntity: {
    type: String,
  },
}));
