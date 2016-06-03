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
          submittedAt: new Date()
        }})

        Mart.Carts.update(this._._id, {$set: {
          state: Mart.Cart.STATES.WAITING_CART_ACCEPTANCE,
          connectionFeeAtCheckout: this._.connectionFee(),
          merchantCutAtCheckout: this._.merchantCut(),
          serviceFeeAtCheckout: this._.serviceFee(),
          taxAtCheckout: this._.tax(),
          totalAtCheckout: this._.total(),
          subtotalAtCheckout: this._.subtotal(),
          preTaxTotalAtCheckout: this._.preTaxTotal(),
          netAtCheckout: this._.net(),
          depositAtCheckout: this._.deposit()
        }})


        Email.send({
          to: pEmail(this._.merchantId),
          from: "SpaceCadet <hello@spacecadet.io>",
          subject: "Approval Needed on New Docking Request",
          text: "Greetings " + pName(this._.merchantId) + "," +
          "\nThank you for granting the SpaceCadet Fleet access to your Property, " +
          "and you have received a request to dock at one of your Spaces. " +
          "Please visit http://spacecadet.io/manage to review and approve the request!" +
          "\n\nHappy Renting!" +
          "\nThe Space Cadets"
        });
      },
      "rejectCart": Mart.Cart.STATES.CANCELLED_BY_MERCHANT,
      "acceptCart": function() {
        console.log('acceptCart');

        // console.log(this._);
        // console.log(this._.firstLineItem());
        // console.log(firstLineItemUnit);
        // if(firstLineItemUnit === Mart.Product.UNITS.MONTH) {
        //   sendCartAcceptanceEmail(this._)
        //   this.handle('convertToSubscription')
        // } else {
          this.handle('makePayment')
        // }
      },
      "makePayment": Mart.Cart.STATES.MAKING_PAYMENT,
      "convertToSubscription": Mart.Cart.STATES.CONVERTED_TO_SUBSCRIPTION,
      _onExit: function() {
      }
    }

    ///////////////////
    // MAKING PAYMENT
    ///////////////////
    fsm.states[Mart.Cart.STATES.MAKING_PAYMENT] = {
      _onEnter: function() {
        console.log('entered making payment');
        Mart.Carts.update(this._._id, {$set: {
          state: Mart.Cart.STATES.MAKING_PAYMENT,
          acceptedAt: new Date()
        }})

        var Stripe = StripeAPI(Meteor.settings.STRIPE_SECRET_KEY);
        var charge = Meteor.wrapAsync(Stripe.charges.create, Stripe.charges);

        var chargeDetails = {
          amount: this._.totalAtCheckout,
          currency: 'usd'
        }

        console.log('looking to charge');
        if(!!this._.cardId) {
          console.log('card exists');
          var card = Mart.Cards.findOne(this._.cardId)
          var cardToken = card.gatewayToken
          var customer = Mart.GatewayTypes.Stripe.Customers.findOne({userId: this._.userId})

          _.extend(chargeDetails, {
            source: cardToken,
            customer: customer.stripeToken
          })
        } else if(!!this._.cardToken) {
          console.log('actually a card token');
          _.extend(chargeDetails, {
            source: this._.cardToken
          })
        }

        try {
          console.log('trying to update cart');
          var resp = charge(chargeDetails);
          Mart.Carts.update(this._._id, {$set: {
            paymentAt: new Date(),
            paymentConfirmation: resp.id,
            paymentAmount: resp.amount
          }})

          this.handle('requestTransferAcceptance')
        } catch (error) {
          console.log(error.message);
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
        console.log('WAITING_TRANSFER_ACCEPTANCE');
        Mart.Carts.update(this._._id, {$set: {
          state: Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE
        }})

        var firstLineItemUnit = this._.firstLineItem().unit
        // console.log('firstLineItem');
        if(firstLineItemUnit === Mart.Product.UNITS.MONTH) {
          const subscriptionId = Mart.Subscription.spawn(this._._id)
          let subscription = Mart.Subscriptions.findOne(subscriptionId)

          // Try to process subscription if start date already passed
          // Otherwise, cron will pick up whenever it runs
          subscription.activate();
          subscription = Mart.Subscriptions.findOne(subscriptionId)
          subscription.process();
        }

        // console.log('deposit');
        if(this._.depositAtCheckout && (this._.depositAtCheckout > 0)) {
          Mart.Deposit.spawn(this._._id)
        }

        // console.log('send email');
        sendCartAcceptanceEmail(this._)

      },
      "processTransfer": Mart.Cart.STATES.PROCESSING_TRANSFER,
      "rejectTransfer": Mart.Cart.STATES.CANCELLED_BY_ADMIN,
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
        var Stripe = StripeAPI(Meteor.settings.STRIPE_SECRET_KEY);

        var transfer = Meteor.wrapAsync(Stripe.transfers.create, Stripe.transfers);

        // Currently assuming that all items in cart belong to the same merchant
        var managedAccount = Mart.GatewayTypes.Stripe.ManagedAccounts.findOne({
          userId: this._.merchantId
        })

        if(!!managedAccount) {
          try {
            // Make the transfer
            var result = transfer({
              amount: this._.merchantCutAtCheckout,
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
            console.log(error.message);
            this.handle('failTransfer')
            throw new Meteor.Error("stripe-transfer-error", error.message);
          }
        } else {
          var msg = "Could not find a managed account for this cart"
          this.handle('failTransfer')
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

        Email.send({
          to: pEmail(this._.userId),
          from: "SpaceCadet <hello@spacecadet.io>",
          subject: "Docking Request Rejected",
          text: "Greetings Captain " + pName(this._.userId) + "," +
                "\nYour request to dock at " + this._.storefrontNameAtCheckout + " has been rejected. We hope there is a better match next time, and please let us know how we can help in the future!" +
                "\n\nHappy Renting!" +
                "\nThe Space Cadets"
        });

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

    // ///////////////////
    // // Converted to subscription
    // ///////////////////
    // fsm.states[Mart.Cart.STATES.CONVERTED_TO_SUBSCRIPTION] = {
    //   _onEnter: function() {
    //     Mart.Carts.update(this._._id, {$set: {state: Mart.Cart.STATES.CONVERTED_TO_SUBSCRIPTION}})
    //
    //     Mart.Subscription.spawn(this._._id)
    //   },
    //   _onExit: function() {
    //     //
    //   }
    // }

    return new machina.Fsm(fsm)
  },
  submitCart: function() {
    this.machina().handle('submitCart')
  },
  rejectCart: function() {
    this.machina().handle('rejectCart')
  },
  acceptCart: function() {
    this.machina().handle('acceptCart')
  },
  processTransfer: function() {
    this.machina().handle('processTransfer')
  },
  rejectTransfer: function() {
    this.machina().handle('rejectTransfer')
  }
})

var pEmail = function(userId) {
  var user = Meteor.users.findOne(userId)
  return user.emails[0].address
}

var pName = function(userId) {
  var user = Meteor.users.findOne(userId)
  return user.profile.firstName
}

var sendCartAcceptanceEmail = function(cart) {
  console.log('sendCartAcceptanceEmail');
  Email.send({
    to: pEmail(cart.userId),
    from: "SpaceCadet <hello@spacecadet.io>",
    subject: "Docking Request Approved",
    text: "Greetings Captain "+ pName(cart.userId) + ",\n\n" +
    "Thank you for choosing to dock at a SpaceCadet Space, " +
    "and your request to dock at " + cart.productNameAtCheckout + ", " + cart.storefrontNameAtCheckout + " has been approved by the Property Commander. " +
    "The details of your docking are below.\n\n" +
    "Please note that if this is a month booking, you will be billed monthly (minus the deposit) until you decide to cancel.\n\n"+
    "Reservation Number: " + cart._id +
    "\n" + cart.addressAtCheckout + " " + cart.cityAtCheckout + ", " + cart.stateAtCheckout +
    // "\n" + moment(new Date(this._.)).format('L')
    // "\n\n" + accounting.formatMoney(docking.dailyPadPrice) + " at " + docking.days + " days = " + accounting.formatMoney(docking.subtotal) +
    "\nSubtotal = " + accounting.formatMoney(cart.subtotalAtCheckout/100) +
    "\nDeposit = " + accounting.formatMoney(cart.depositAtCheckout/100) +
    "\nService Fee = " + accounting.formatMoney(cart.serviceFeeAtCheckout/100) +
    "\n\nTotal  = " + accounting.formatMoney(cart.totalAtCheckout/100) +
    "\n\nHappy Renting!\n" +
    "The Space Cadets"
  });
}
