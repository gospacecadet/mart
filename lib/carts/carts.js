Mart.Carts = new Mongo.Collection("MartCarts");
Mart.Cart = {
  GUEST_ID: 'mart-cart-guest-id',
  SESSION_ID: 'mart-cart-session-id',
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
}

Mart.Carts.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    optional: true
  },
  guestId: {
    type: String,
    optional: true
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
