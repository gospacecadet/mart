Mart.Carts = new Mongo.Collection("MartCarts", {
  transform: function (doc) { return new Cart(doc); }
});

Cart = function(doc) {
  _.extend(this, doc)
}

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
    AUTHORIZING_PAYMENT: "mart-cart-state-authorizing-payment",
    WAITING_CART_ACCEPTANCE: "mart-cart-state-waiting-cart-acceptance",
    MAKING_PAYMENT: 'mart-cart-state-making-payment',
    WAITING_FUNDS_RELEASE: 'mart-cart-state-waiting-funds-release',
    SETTLED: 'mart-cart-state-settled',
    CANCELLED_BY_MERCHANT: 'mart-cart-state-cancelled-by-merchant',
    CANCELLED_BY_PAYMENT: 'mart-cart-state-cancelled-by-payment',
    CANCELLED_BY_ADMIN: 'mart-cart-state-cancelled-by-admin',
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
