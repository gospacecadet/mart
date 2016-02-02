_.extend(Mart.Subscription, {
  spawn: function(cartId) {
    var cart = Mart.Carts.findOne(cartId)

    Mart.Subscriptions.insert({
      originalCartId: cartId,
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
