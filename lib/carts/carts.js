Mart.Carts = new Mongo.Collection("MartCarts");
Mart.Cart = {
  cart: function(cartId) {
    return Mart.Cart.findOne({
      userId: this.userId,
      _id: cartId
    })
  },
  currentCart: function() {
    return Mart.Cart.findOne({
      state: Mart.Cart.STATES.SHOPPING,
      userId: this.userId
    })
  },
  currentCartId: function() {
    return this.currentCart()._id
  },
  lineItems: function(cartId) {
    return Mart.LineItems.find({cartId: cartId}).fetch()
  },
  subtotal: function(cartId) {
    var that = this
    return _.reduce(this.lineItems(cartId), function(sum, lineItem) {
      console.log("SUBTOTAL: " + cartId + "    " + that.lineItems(cartId).length + "    "  + sum);
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
