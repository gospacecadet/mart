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

        var chargeDetails = {
          amount: this._.total(),
          currency: 'usd'
        }

        if(!!this._.cardId) {
          var card = Mart.Cards.findOne(this._.cardId)
          var cardToken = card.gatewayToken
          var customer = Mart.GatewayTypes.Stripe.Customers.findOne({userId: this._.userId})

          _.extend(chargeDetails, {
            source: cardToken,
            customer: customer.stripeToken
          })
        } else if(!!this._.cardToken) {
          _.extend(chargeDetails, {
            source: this._.cardToken
          })
        }

        try {
          var resp = charge(chargeDetails);
          Mart.Carts.update(this._._id, {$set: {
            paymentAt: new Date(),
            paymentConfirmation: resp.id,
            paymentAmount: resp.amount
          }})
          this.handle('requestTransferAcceptance')
        } catch (error) {
          this.handle('failPayment')
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
