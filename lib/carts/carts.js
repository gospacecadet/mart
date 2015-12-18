Mart.Carts = new Mongo.Collection("MartCarts", {
  transform: function (doc) { return new Cart(doc); }
});

Cart = function(doc) {
  _.extend(this, doc)
}

_.extend(Cart.prototype, {
  subtotal: function() {
    var lines = Mart.LineItems.find({cartId: this._id}).fetch()
    return _.reduce(lines, function(sum, line) {
      return sum + line.subtotal()
    }, 0)
  },
  preTaxTotal: function() {
    return this.subtotal() + this.serviceFee
  },
  total: function() {
    return this.preTaxTotal() + this.tax
  }
})

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
    WAITING_CART_ACCEPTANCE: "mart-cart-state-waiting-cart-acceptance",
    MAKING_PAYMENT: 'mart-cart-state-making-payment',
    WAITING_TRANSFER_ACCEPTANCE: 'mart-cart-state-waiting-transfer-acceptance',
    PROCESSING_TRANSFER: 'mart-cart-state-processing-transfer',
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
  serviceFee: {
    type: Number,
  },
  connectionFee: {
    type: Number,
  },
  merchantCut: {
    type: Number,
  },
  tax: {
    type: Number,
  },
  paymentAt: {
    type: Date,
  },
  paymentConfirmation: {
    type: String
  },
  paymentAmount: {
    type: Number,
  },
  cartAcceptedAt: {
    type: Date
  },
  transferredAt: {
    type: Date
  },
  transferredToBankAccountId: {
    type: String,
    optional: true
  },
  transferredToManagedAccountId: {
    type: String,
  },
  transferAcceptedAt: {
    type: Date
  },
  transferConfirmation: {
    type: String
  },
  transferAmount: {
    type: Number
  },
  settledAt: {
    type: Number
  },
  transferAcceptedByAdminId: {
    type: String
  }
}));
