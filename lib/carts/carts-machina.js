_.extend(Cart.prototype, {
  machina: function() {
    var fsm = {
      _: this,
      initialize: function(options) {
      },
      namespace: "mart-cart",
      initialState: "uninitialized",
      states: {
        uninitialized: {
          "*": function() {
            this.deferUntilTransition();
            this.transition(this._.state || Mart.Cart.STATES.SHOPPING);
          }
        },
      }
    }

    fsm.states[Mart.Cart.STATES.SHOPPING] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.SHOPPING}})
      },
      "submitCart": Mart.Cart.STATES.WAITING_CART_ACCEPTANCE,
      _onExit: function() {
        // create new cart?
      }
    }

    fsm.states[Mart.Cart.STATES.WAITING_CART_ACCEPTANCE] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.WAITING_CART_ACCEPTANCE}})
      },
      "rejectCart": Mart.Cart.STATES.CANCELLED_BY_MERCHANT,
      "makePayment": Mart.Cart.STATES.MAKING_PAYMENT,
      _onExit: function() {
        //
      }
    }

    fsm.states[Mart.Cart.STATES.MAKING_PAYMENT] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.MAKING_PAYMENT}})
        // var Stripe = StripeAPI(cart.secretKey || Meteor.settings.stripe_sk);
        // var charge = Meteor.wrapAsync(Stripe.charges.create, Stripe.charges);
        //
        // try {
        //   charge({
        //     amount: (docking.total * 100).toFixed(0),
        //     currency: 'usd',
        //     source: card.token
        //   });
        // } catch (error) {
        //   throw new Meteor.Error("stripe-charge-error", error.message);
        // }
        // do stripe stuff
      },
      "requestTransferAcceptance": Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE,
      "failPayment": Mart.Cart.STATES.CANCELLED_BY_PAYMENT,
      _onExit: function() {
        //
      }
    }

    // Cancelled States

    fsm.states[Mart.Cart.STATES.CANCELLED_BY_MERCHANT] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.CANCELLED_BY_MERCHANT}})
      },
      _onExit: function() {
        //
      }
    }

    return new machina.Fsm(fsm)
  },
  submitCart: function() {
    this.machina().handle('submitCart')
  },
  rejectCart: function() {
    this.machina().handle('rejectCart')
  },
  makePayment: function() {
    this.machina().handle('makePayment')
  }
})

Meteor.methods({
  'mart/submit-cart': function(cartId, options) {
    var cart = checkAndGetCart(cartId)
    check(options, Match.Optional({
      serviceFeePct: Number,
      connectionFeePct: Number,
      taxPct: Number,
      merchantCut: Number
    }))

    if(options) {
      cart.serviceFeePct = options.serviceFeePct
      cart.connectionFeePct = options.connectionFeePct
      cart.taxPct = options.taxPct
      cart.merchantCut = options.merchantCut
    }

    cart.submitCart()
    return cart._id
  },
  'mart/make-payment': function(cartId, options) {
    var cart = checkAndGetCart(cartId)
    check(options, Match.Optional({
      secretKey: String,
      publicKey: String
    }))

    if(options) {
      cart.secretKey = options.secretKey
      cart.publicKey = options.publicKey
    }

    cart.makePayment()
    return cart._id
  }
});

var checkAndGetCart = function(cartId) {
  check(cartId, String)

  var cart = Mart.Carts.findOne(cartId)
  if(cart.userId !== Meteor.userId()) {
    throw new Meteor.Error(1, "Don't fuck with other people's carts");;
  }

  return cart
}
