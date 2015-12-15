_.extend(Cart.prototype, {
  machina: function() {
    var fsm = {
      _: this,
      initialize: function(options) {
      },
      namespace: "mart-cart",
      initialState: this.state || "uninitialized",
      states: {
        uninitialized: {
          "*": function() {
            this.deferUntilTransition();
            this.transition(Mart.Cart.STATES.SHOPPING);
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
        Mart.Carts.update(this._._id, {$set: {
          state: Mart.Cart.STATES.WAITING_CART_ACCEPTANCE}})

        var connectionFeePct = this._.connectionFeePct || Meteor.settings.connectionFeePct
        var serviceFeePct = this._.serviceFeePct || Meteor.settings.serviceFeePct
        var taxPct = this._.taxPct || Meteor.settings.taxPct

        // Whenever object is accessed, this will be called w/ no arguments
        if(!!connectionFeePct && !!serviceFeePct && !!taxPct) {
          var subtotal = this._.subtotal()
          var connectionFee = Math.floor(connectionFeePct * subtotal)
          var merchantCut = Math.ceil((1-connectionFeePct) * subtotal)
          var serviceFee = Math.floor(serviceFeePct * subtotal)
          var tax = Math.floor(taxPct * (subtotal + serviceFee))

          Mart.Carts.update(this._._id, {$set: {
            state: Mart.Cart.STATES.WAITING_CART_ACCEPTANCE,
            connectionFee: connectionFee,
            merchantCut: merchantCut,
            serviceFee: serviceFee,
            tax: tax
          }})
        }
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
        var secretKey = this._.secretKey || Meteor.settings.stripe_sk
        var Stripe = StripeAPI(secretKey);
        var charge = Meteor.wrapAsync(Stripe.charges.create, Stripe.charges);
        var total = this._.total()
        var card = Mart.Cards.findOne(this._.cardId)

        if(!!card) {
          var customer = Mart.GatewayTypes.Stripe.Customers.findOne({userId: Meteor.userId()})
          var cardToken = card.gatewayToken
          try {
            var resp = charge({
              amount: total,
              currency: 'usd',
              source: cardToken,
              customer: customer.stripeToken
            });

            Mart.Carts.update(this._._id, {$set: {
              paymentAt: new Date(),
              paymentConfirmation: resp.id,
              paymentAmount: resp.amount
            }})
            this.handle('requestTransferAcceptance')
          } catch (error) {
            this.handle('failPayment')
          }
        }
      },
      "requestTransferAcceptance": Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE,
      "failPayment": Mart.Cart.STATES.CANCELLED_BY_PAYMENT,
      _onExit: function() {
        //
      }
    }

    fsm.states[Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE}})
      },
      "submitCart": Mart.Cart.STATES.WAITING_CART_ACCEPTANCE,
      _onExit: function() {
        // create new cart?
      }
    }

    ///////////////////
    // Cancelled States
    ///////////////////
    fsm.states[Mart.Cart.STATES.CANCELLED_BY_MERCHANT] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.CANCELLED_BY_MERCHANT}})
      },
      _onExit: function() {
        //
      }
    }

    fsm.states[Mart.Cart.STATES.CANCELLED_BY_PAYMENT] = {
      _onEnter: function() {
        console.log("CANCELLED_BY_PAYMENT");
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.CANCELLED_BY_PAYMENT}})
      },
      _onExit: function() {
        //
      }
    }

    fsm.states[Mart.Cart.STATES.CANCELLED_BY_ADMIN] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.CANCELLED_BY_ADMIN}})
      },
      _onExit: function() {
        //
      }
    }

    return new machina.Fsm(fsm)
  },
  submitCart: function(options) {
    if(options) {
      this.serviceFeePct = options.serviceFeePct
      this.connectionFeePct = options.connectionFeePct
      this.taxPct = options.taxPct
    }

    this.machina().handle('submitCart')
  },
  rejectCart: function() {
    this.machina().handle('rejectCart')
  },
  makePayment: function(options) {
    if(options) {
      this.secretKey = options.secretKey
    }
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
    }))

    cart.submitCart(options)
    return cart._id
  },
  'mart/make-payment': function(cartId, options) {
    var cart = checkAndGetCart(cartId)
    check(options, Match.Optional({
      secretKey: String,
    }))

    cart.makePayment(options)
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
