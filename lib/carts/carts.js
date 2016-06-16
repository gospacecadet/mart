Mart.Carts = new Mongo.Collection("MartCarts", {
  transform: function (doc) { return new Cart(doc); }
});

Cart = function(doc) {
  _.extend(this, doc)
}

_.extend(Cart.prototype, {
  durationStr() {
    const li = this.firstLineItem();
    return li.quantity + " " + li.unit + "s"
  },
  firstLineItem: function() {
    return Mart.LineItems.findOne({cartId: this._id}, {sort: {startAtDate: 1}})
  },
  subtotal: function() {
    var lines = Mart.LineItems.find({cartId: this._id}).fetch()
    return _.reduce(lines, function(sum, line) {
      var _line = Mart.LineItems.findOne(line._id)
      return sum + _line.subtotalAtCheckout
    }, 0)
  },
  deposit: function() {
    var lines = Mart.LineItems.find({cartId: this._id}).fetch()
    return _.reduce(lines, function(sum, line) {
      var _line = Mart.LineItems.findOne(line._id)

      return sum + _line.depositAtCheckout
    }, 0)
  },
  connectionFee: function() {
    var lines = Mart.LineItems.find({cartId: this._id}).fetch()
    var lineConnection = _.reduce(lines, function(sum, line) {
      var _line = Mart.LineItems.findOne(line._id)
      return sum + _line.connectionFeeAtCheckout
    }, 0)

    return Math.floor(lineConnection)
  },
  merchantCut: function() {
    return this.subtotal() - this.connectionFee()
  },
  preServiceFeeTotal() {
    return this.subtotal() + this.deposit()
  },
  serviceFee: function() {
    return Math.floor(this.subtotal() * Mart.SERVICE_FEE_PCT)
  },
  recurringTotal() {
    return this.serviceFee() + this.subtotal()
  },
  preTaxTotal: function() {
    return this.preServiceFeeTotal() + this.serviceFee()
  },
  total: function() {
    return this.preTaxTotal() + this.tax()
  },
  lineItems: function() {
    return Mart.LineItems.find({cartId: this._id}).fetch()
  },
  tax: function() {
    return Math.floor(this.preTaxTotal() * Mart.TAX_PCT)
  },
  net: function() {
    return Math.floor(this.total() - this.merchantCut() - this.deposit())
  },
  lastBookingStarts: function() {
    var lastBookingStarts

    _.each(this.lineItems(), function(line) {
      if(!lastBookingStarts || lastBookingStarts < line.startAtDate )
        lastBookingStarts = line.startAtDate
    })

    return lastBookingStarts
  },
  firstBookingStarts: function() {
    var firstBookingStarts

    _.each(this.lineItems(), function(line) {
      if(!firstBookingStarts || (firstBookingStarts > line.startAtDate) )
        firstBookingStarts = line.startAtDate
    })

    return firstBookingStarts
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
    CONVERTED_TO_SUBSCRIPTION: 'mart-converted-to-subscription',
  },
  _STATES: function() {
    return _.map(this.STATES, function(v, k) {
      return v
    })
  }
}

Mart.Carts.attachSchema(new SimpleSchema({
  state: {
    type: String,
  },
  subscriptionId: {
    type: String,
    optional: true
  },
  merchantId: {
    type: String,
  },
  storefrontId: {
    type: String
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
  depositAtCheckout: {
    type: Number,
    optional: true
  },
  storefrontNameAtCheckout: {
    type: String,
    optional: true
  },
  productNameAtCheckout: {
    type: String,
    optional: true
  },
  addressAtCheckout: {
    type: String,
    optional: true
  },
  storefrontIdAtCheckout: {
    type: String,
    optional: true
  },
  addressAtCheckout: {
    type: String,
    optional: true
  },
  address2AtCheckout: {
    type: String,
    optional: true
  },
  cityAtCheckout: {
    type: String,
    optional: true
  },
  stateAtCheckout: {
    type: String,
    optional: true
  },
  zipAtCheckout: {
    type: String,
    optional: true
  },
  connectionFeeAtCheckout: {
    type: Number,
    optional: true
  },
  serviceFeeAtCheckout: {
    type: Number,
    optional: true
  },
  merchantCutAtCheckout: {
    type: Number,
    optional: true
  },
  taxAtCheckout: {
    type: Number,
    optional: true
  },
  netAtCheckout: {
    type: Number,
    optional: true
  },
  totalAtCheckout: {
    type: Number,
    optional: true
  },
  subtotalAtCheckout: {
    type: Number,
    optional: true
  },
  preTaxTotalAtCheckout: {
    type: Number,
    optional: true
  },
  contactRentingOnBehalfBiz: {
    type: Boolean,
    optional: true,
  },
  contactFirstName: {
    type: String,
    optional: true,
  },
  contactLastName: {
    type: String,
    optional: true,
  },
  contactEmail: {
    type: String,
    optional: true,
  },
  contactPhone: {
    type: String,
    optional: true,
  },
  contactBusiness: {
    type: String,
    optional: true,
  },
  contactAddress: {
    type: String,
    optional: true,
  },
  contactAddress2: {
    type: String,
    optional: true,
  },
  contactCity: {
    type: String,
    optional: true,
  },
  contactZIP: {
    type: String,
    optional: true,
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
  acceptedAt: {
    type: Date,
    optional: true
  },
  submittedAt: {
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
  },
  referer: {
    type: String,
    optional: true
  }
}));
