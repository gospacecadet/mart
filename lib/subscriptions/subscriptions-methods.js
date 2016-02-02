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
  'mart/subscription/cancel':function(subscriptionId) {
    check(subscriptionId, String);


    if(Mart._isMerchant(this.userId)) {
      var subscription = Mart.Subscriptions.findOne({merchantId: this.userId, _id: subscriptionId})

      if(subscription)
        return Mart.Subscriptions.update(subscriptionId, {$set: {state: Mart.Subscription.STATES.CANCELLED_BY_MERCHANT}})
    }


    var subscription = Mart.Subscriptions.findOne({userId: this.userId, _id: subscriptionId})

    if(!subscription)
      throw new Meteor.Error('unauthorized', 'You cannot do that')

    return Mart.Subscriptions.update(subscriptionId, {$set: {state: Mart.Subscription.STATES.CANCELLED_BY_SHOPER}})

  }
});
