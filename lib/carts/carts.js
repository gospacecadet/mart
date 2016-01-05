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
  },
  lineItems: function() {
    return Mart.LineItems.find({cartId: this._id}).fetch()
  }
})

canOpCartWaitingCartAcceptance = function(cartId) {
  var firstStorefront = getFirstStorefront(cartId)
  return Mart.isAdmin() ||                                                // is admin
    (Mart.isMerchant() && firstStorefront.userId === Meteor.userId()) ||  // storefront belongs to merchant
    (Mart.isRep() && firstStorefront.repId === Meteor.userId())           // belongs to rep
}

canOpCartShopping = function(cartId) {
  var cart = Mart.Carts.findOne(cartId)
  return (!!cart.userId && cart.userId === Meteor.userId()) ||  // cart belongs to user
    (cart.guestId && !cart.userId)                              // cart doesn't belong to anybody
}

getFirstStorefront = function(cartId) {
  var firstLineItem = Mart.LineItems.findOne({cartId: cartId})
  var firstProduct = Mart.Products.findOne(firstLineItem.productId)
  return Mart.Storefronts.findOne(firstProduct.storefrontId)
}

Mart.Cart = {
  GUEST_ID: 'mart-cart-guest-id',
  SESSION_ID: 'mart-cart-session-id',
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
  state: {
    type: String,
  },
  merchantId: {
    type: String,
  },
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
    optional: true
  },
  cardToken: {
    type: String,
    optional: true
  },
  contactName: {
    type: String,
    optional: true
  },
  contactEmail: {
    type: String,
    optional: true
  },
  contactPhone: {
    type: String,
    optional: true
  },
  contactEntity: {
    type: String,
    optional: true
  },
  serviceFee: {
    type: Number,
    optional: true
  },
  connectionFee: {
    type: Number,
    optional: true
  },
  merchantCut: {
    type: Number,
    optional: true
  },
  tax: {
    type: Number,
    optional: true
  },
  paymentAt: {
    type: Date,
    optional: true
  },
  paymentConfirmation: {
    type: String,
    optional: true
  },
  paymentAmount: {
    type: Number,
    optional: true
  },
  cartAcceptedAt: {
    type: Date,
    optional: true
  },
  transferredAt: {
    type: Date,
    optional: true
  },
  transferredToBankAccountId: {
    type: String,
    optional: true
  },
  transferredToManagedAccountId: {
    type: String,
    optional: true
  },
  transferAcceptedAt: {
    type: Date,
    optional: true
  },
  transferConfirmation: {
    type: String,
    optional: true
  },
  transferAmount: {
    type: Number,
    optional: true
  },
  settledAt: {
    type: Date,
    optional: true
  },
  transferAcceptedByAdminId: {
    type: String,
    optional: true
  }
}));
