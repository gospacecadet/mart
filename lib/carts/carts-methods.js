Meteor.methods({
  'mart/submit-carts': function(options) {
    // console.log('mart/submit-carts');
    check(options, {
      cartId: String,
      cardId: Match.Optional(String),
      cardTokens: Match.Optional([String]),
      contactFirstName: String,
      contactLastName: String,
      contactRentingOnBehalfBiz: Boolean,
      contactEmail: String,
      contactPhone: String,
      contactBusiness: Match.Optional(String),
      contactAddress: String,
      contactAddress2: Match.Optional(String),
      contactCity: String,
      contactState: String,
      contactZIP: String,
      guestId: Match.Optional(String)
    })

    // Get selector for user or guest
    var userGuestSelector
    if(!!Meteor.userId()) {
      userGuestSelector = {userId: Meteor.userId()}
    } else if (!!options.guestId) {
      userGuestSelector = {guestId: options.guestId}
    } else {
      throw new Meteor.Error('invalid-guest', "User not logged in and did not provide a guest ID while trying to check out.");
    }

    // Ensure card belongs to the person trying to checkout
    var cardSelector = _.extend({ _id: options.cardId}, userGuestSelector)
    var card = Mart.Cards.findOne(cardSelector)
    if(!!card) {
      var shoppingCartsSelector = _.extend({
        state: Mart.Cart.STATES.SHOPPING,
        _id: options.cartId
      }, userGuestSelector)
      var shoppingCarts = Mart.Carts.find(shoppingCartsSelector)
      console.log(shoppingCarts.count());

      // Submit each cart individually to respective Merchants

      if(shoppingCarts.count() > 0) {
        shoppingCarts = shoppingCarts.fetch()
        console.log('shoppingCarts');
        _.each(shoppingCarts, function(shoppingCart) {
          console.log(shoppingCart);
          Mart.Carts.update(shoppingCart._id, {$set: options})
          Meteor.call("mart/submit-cart", shoppingCart._id);
        })

        var shoppingCartIds = _.pluck(shoppingCarts, "_id")
        return shoppingCartIds
      }
    } else if(!!options.cardTokens) {
      var cardTokens = options.cardTokens
      delete options.cardTokens
      var shoppingCartsSelector = _.extend({state: Mart.Cart.STATES.SHOPPING}, userGuestSelector)
      var shoppingCarts = Mart.Carts.find(shoppingCartsSelector)

      // Submit each cart individually to respective Merchants with a different card token
      if(shoppingCarts.count() > 0) {
        shoppingCarts = shoppingCarts.fetch()
        for(let i = 0; i < shoppingCarts.length; i++) {
          let shoppingCart = shoppingCarts[i]
          Mart.Carts.update(shoppingCart._id, {
            $set: _.extend({cardToken: cardTokens[i]}, options)
          })
          Meteor.call("mart/submit-cart", shoppingCart._id);
        }

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
  'mart/accept-cart': function(cartId) {
    check(cartId, String)
    if(canOpCartWaitingCartAcceptance(cartId)) {
      var cart = Mart.Carts.findOne(cartId)
      cart.acceptCart()
      return cart._id
    }

    throw new Meteor.Error('not-authorized', "You do not have permission to accept this order.");
  },
  'mart/process-transfer': function(cartId) {
    check(cartId, String)
    if(Mart.isAdmin()) {
      var cart = Mart.Carts.findOne(cartId)
      cart.processTransfer()
      return cart._id
    }

    throw new Meteor.Error('not-authorized', "Only admins can process transfers");
  },
  'mart/reject-transfer': function(cartId) {
    check(cartId, String)
    if(Mart.isAdmin()) {
      var cart = Mart.Carts.findOne(cartId)
      cart.processTransfer()
      return cart._id
    }

    throw new Meteor.Error('not-authorized', "Only admins can process transfers");
  },
  'mart/reject-cart': function(cartId) {
    check(cartId, String)
    if(canOpCartWaitingCartAcceptance(cartId)) {
      var cart = Mart.Carts.findOne(cartId)
      cart.rejectCart()
      return cart._id
    }

    throw new Meteor.Error('not-authorized', "You do not have permission to modify this order.");
  }
});
