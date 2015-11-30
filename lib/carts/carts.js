Mart.Carts = new Mongo.Collection("MartCarts");
Mart.Cart = {
  cart: function(cartId) {
    return Mart.Cart.findOne({
      // userId: Meteor.userId(),
      _id: cartId
    })
  },
  lineItems: function(cartId) {
    return Mart.LineItems.find({cartId: cartId}).fetch()
  },
  subtotal: function(cartId) {
    var that = this
    return _.reduce(this.lineItems(cartId), function(sum, lineItem) {
      return sum + Mart.LineItem.subtotal(lineItem._id)
    }, 0)
  },
  STATES: {
    SHOPPING: "mart-cart-state-shopping",
    PAID: "mart-cart-state-paid",
    AWAITING_PAYMENT: "mart-cart-state-awaiting-payment",
  },
  currentCart: function() {
    return Mart.Carts.findOne({
      userId: Meteor.userId(),
      state: Mart.Cart.STATES.SHOPPING
    })
  },
  currentCartId: function() {
    if(this.currentCart())
      return this.currentCart()._id

    return undefined
  }
}

Mart.Carts.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    autoValue: function() {
      return this.userId;
    }
  },
  cardId: {
    type: String,
  },
  state: {
    type: String,
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
