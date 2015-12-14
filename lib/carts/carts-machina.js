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
      },
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
