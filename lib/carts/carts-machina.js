_.extend(Cart.prototype, {
  machina: function() {
    var fsm = {
      _: this,
      initialize: function() {
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

    ///////////////////
    // SHOPPING
    ///////////////////
    fsm.states[Mart.Cart.STATES.SHOPPING] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.SHOPPING}})
      },
      "submitCart": Mart.Cart.STATES.WAITING_CART_ACCEPTANCE,
      _onExit: function() {
        // create new cart?
      }
    }

    ///////////////////
    // WAITING CART ACCEPTANCE
    ///////////////////
    fsm.states[Mart.Cart.STATES.WAITING_CART_ACCEPTANCE] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {
          state: Mart.Cart.STATES.WAITING_CART_ACCEPTANCE,
          cartAcceptedAt: new Date()
        }})

        var connectionFeePct = Meteor.settings.connectionFeePct
        var serviceFeePct = Meteor.settings.serviceFeePct
        var taxPct = Meteor.settings.taxPct

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
      }
    }

    ///////////////////
    // MAKING PAYMENT
    ///////////////////
    fsm.states[Mart.Cart.STATES.MAKING_PAYMENT] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.MAKING_PAYMENT}})
        var Stripe = StripeAPI(Meteor.settings.stripeSecretKey);
        var charge = Meteor.wrapAsync(Stripe.charges.create, Stripe.charges);
        var total = this._.total()
        var card = Mart.Cards.findOne(this._.cardId)

        if(!!card) {
          var customer = Mart.GatewayTypes.Stripe.Customers.findOne({userId: this._.userId})
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
      }
    }


    ///////////////////
    // WAITING TRANSFER ACCEPTANCE
    ///////////////////
    fsm.states[Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE}})
      },
      "processTransfer": Mart.Cart.STATES.PROCESSING_TRANSFER,
      _onExit: function() {
      }
    }

    ///////////////////
    // PROCESSING TRANSFER
    ///////////////////
    fsm.states[Mart.Cart.STATES.PROCESSING_TRANSFER] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {
          state: Mart.Cart.STATES.PROCESSING_TRANSFER,
          transferAcceptedAt: new Date(),
        }})
        var Stripe = StripeAPI(Meteor.settings.stripeSecretKey);

        var transfer = Meteor.wrapAsync(Stripe.transfers.create, Stripe.transfers);

        // Currently assuming that all items in cart belong to the same merchant
        var firstStorefront = getFirstStorefront(this._._id)
        var managedAccount = Mart.GatewayTypes.Stripe.ManagedAccounts.findOne({
          userId: firstStorefront.userId
        })

        if(!!managedAccount) {
          try {
            // Make the transfer
            var result = transfer({
              amount: this._.merchantCut,
              currency: "usd",
              destination: managedAccount.stripeToken,
              description: "Transfer for cart " + this._._id
            });

            // Update the cart
            Mart.Carts.update(this._._id, {$set: {
              transferredAt: new Date(),
              transferAcceptedByAdminId: Meteor.userId(),
              transferConfirmation: result.id,
              transferAmount: result.amount,
              transferredToManagedAccountId: managedAccount._id
            }})

            this.handle('settle')
          } catch (error) {
            throw new Meteor.Error("stripe-transfer-error", error.message);
          }
        } else {
          var msg = "Could not find a managed account for this cart"
          throw new Meteor.Error("carts-state-processing-transfer", msg);
        }

      },
      "settle": Mart.Cart.STATES.SETTLED,
      "failTransfer": Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE,
      _onExit: function() {
        //
      }
    }

    ///////////////////
    // SETTLED
    ///////////////////
    fsm.states[Mart.Cart.STATES.SETTLED] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {
          state: Mart.Cart.STATES.SETTLED,
          settledAt: new Date()
        }})
      },
      _onExit: function() {
        //
      }
    }

    ///////////////////
    // Cancelled BY MERCHANT
    ///////////////////
    fsm.states[Mart.Cart.STATES.CANCELLED_BY_MERCHANT] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.CANCELLED_BY_MERCHANT}})
      },
      _onExit: function() {
        //
      }
    }

    ///////////////////
    // Cancelled BY PAYMENT
    ///////////////////
    fsm.states[Mart.Cart.STATES.CANCELLED_BY_PAYMENT] = {
      _onEnter: function() {
        Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.CANCELLED_BY_PAYMENT}})
      },
      _onExit: function() {
        //
      }
    }

    ///////////////////
    // Cancelled BY ADMIN
    ///////////////////
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
  submitCart: function() {
    this.machina().handle('submitCart')
  },
  rejectCart: function() {
    this.machina().handle('rejectCart')
  },
  makePayment: function() {
    this.machina().handle('makePayment')
  },
  processTransfer: function() {
    this.machina().handle('processTransfer')
  }
})

Meteor.methods({
  'mart/submit-carts': function(options) {
    check(options, {
      cardId: String,
      contactName: String,
      contactEmail: String,
      contactPhone: String,
      contactEntity: String,
      guestId: Match.Optional(String)
    })

    // Get selector for user or guest
    var userGuestSelector
    if(Meteor.userId()) {
      userGuestSelector = {userId: Meteor.userId()}
    } else if (options.guestId) {
      userGuestSelector = {guestId: options.guestId}
    } else {
      throw new Meteor.Error('invalid-guest', "User not logged in and did not provide a guest ID while trying to check out.");
    }

    // Ensure card belongs to the person trying to checkout
    var cardSelector = _.extend({ _id: options.cardId}, userGuestSelector)
    var card = Mart.Cards.findOne(cardSelector)
    if(!!card) {
      var shoppingCartsSelector = _.extend({state: Mart.Cart.STATES.SHOPPING}, userGuestSelector)
      var shoppingCarts = Mart.Carts.find(shoppingCartsSelector)

      // Submit each cart individually to respective Merchants
      if(shoppingCarts.count() > 0) {
        _.each(shoppingCarts.fetch(), function(shoppingCart) {
          Mart.Carts.update(shoppingCart._id, {$set: options})
          Meteor.call("mart/submit-cart", shoppingCart._id);
        })

        return true
      }
    }
    throw new Meteor.Error('invalid-card', "Trying to checkout with a card that does not belong to user or guest.");
  },
  'mart/submit-cart': function(cartId) {
    check(cartId, String)

    if(canOpCartShopping(cartId)) {
      var cart = Mart.Carts.findOne(cartId)
      cart.submitCart()
      return cart._id
    }

    throw new Meteor.Error('invalid-cart', "Don't fuck with other people's carts");
  },
  'mart/make-payment': function(cartId) {
    check(cartId, String)
    if(canOpCartWaitingCartAcceptance(cartId)) {
      var cart = Mart.Carts.findOne(cartId)
      cart.makePayment()
      return cart._id
    }

    throw new Meteor.Error(1, "");
  },
  'mart/process-transfer': function(cartId) {
    check(cartId, String)
    if(Mart.isAdmin()) {
      var cart = Mart.Carts.findOne(cartId)
      cart.processTransfer()
      return cart._id
    }

    throw new Meteor.Error(1, "Only admins can process transfers");
  }
});

var canOpCartWaitingCartAcceptance = function(cartId) {
  var firstStorefront = getFirstStorefront(cartId)
  return Mart.isAdmin() ||                                                // is admin
    (Mart.isMerchant() && firstStorefront.userId === Meteor.userId()) ||  // storefront belongs to merchant
    (Mart.isRep() && firstStorefront.repId === Meteor.userId())           // belongs to rep
}

var canOpCartShopping = function(cartId) {
  var cart = Mart.Carts.findOne(cartId)
  return (!!cart.userId && cart.userId === Meteor.userId()) ||  // cart belongs to user
    (cart.guestId && !cart.userId)                              // cart doesn't belong to anybody
}

var getFirstStorefront = function(cartId) {
  var firstLineItem = Mart.LineItems.findOne({cartId: cartId})
  var firstProduct = Mart.Products.findOne(firstLineItem.productId)
  return Mart.Storefronts.findOne(firstProduct.storefrontId)
}
