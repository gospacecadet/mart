_.extend(Mart.Subscription, {
  spawn: function(cartId) {
    var cart = Mart.Carts.findOne(cartId)

    Mart.Subscriptions.insert({
      originalCartId: cartId,
      storefrontName: cart.storefrontNameAtCheckout,
      productName: cart.productNameAtCheckout,
      merchantId: cart.merchantId,
      userId: cart.userId,
      subtotal: cart.subtotalAtCheckout,
      serviceFee: cart.serviceFeeAtCheckout,
      tax: cart.taxAtCheckout,
      total: cart.totalAtCheckout,
      merchantCut: cart.merchantCutAtCheckout,
      connectionFee: cart.connectionFeeAtCheckout,
      name: cart.storefrontNameAtCheckout,
      startAt: cart.firstLineItem().startAtDate,
      state: Mart.Subscription.STATES.SPAWNED,
      createdAt: new Date()
    })
  }
})

Meteor.methods({
  'mart/subscription/cancel': function(subscriptionId) {
    check(subscriptionId, String);

    var stateTo, subscription

    if(Mart._isMerchant(this.userId)) {
      subscription = Mart.Subscriptions.findOne({merchantId: this.userId, _id: subscriptionId})

      if(subscription)
        stateTo = Mart.Subscription.STATES.CANCELLED_BY_MERCHANT
    }

    if(!subscription)
      subscription = Mart.Subscriptions.findOne({userId: this.userId, _id: subscriptionId})

    if(!subscription)
      throw new Meteor.Error('unauthorized', 'You cannot do that')

    if(!stateTo)
      stateTo = Mart.Subscription.STATES.CANCELLED_BY_SHOPPER

    if(subscription.state === Mart.Subscription.STATES.ACTIVE) {
      var Stripe = StripeAPI(Meteor.settings.STRIPE_SECRET_KEY);
      var cancelSubscription = Meteor.wrapAsync(Stripe.customers.cancelSubscription, Stripe.customers);
      var cart = this.cart()
      var customer = Mart.GatewayTypes.Stripe.Customers.findOne({userId: cart.userId})

      try {
        cancelSubscription(customer.stripeToken, subscription.gatewayToken)
        return Mart.Subscriptions.update(subscriptionId, {$set: {
          state: stateTo
        }})
      } catch (error) {
        throw new Meteor.Error("stripe-cancel-subscription-error", error.message);
      }
    } else if(subscription.state === Mart.Subscription.STATES.SPAWNED) {
      return Mart.Subscriptions.update(subscriptionId, {$set: {
        state: stateTo
      }})
    }

  }
});
