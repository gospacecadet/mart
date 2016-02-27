_.extend(Mart.Deposit, {
  spawn(cartId) {
    var cart = Mart.Carts.findOne(cartId)

    Mart.Deposits.insert({
      cartId: cartId,
      shopperId: cart.userId,
      merchantId: cart.merchantId,
      amountInCents: cart.totalAtCheckout,
      state: Deposit.STATES.PENDING,
    })
  },
})

Meteor.methods({
  'mart/process-deposit': function(depositId, paidToShopper, paidToMerchant) {
    check(depositId, String);
    check(paidToShopper, Number);
    check(paidToMerchant, Number);

    if(Mart.isAdmin()) {
      if(deposit.state === Deposit.STATES.PENDING) {
        Mart.update(depositId, {$set: {
          paidToShopper: paidToShopper,
          paidToMerchant: paidToMerchant
        }})

        processDeposit(depositId);
      }
    } else {
      throw new Meteor.Error('unauthorized-action', "You cant do that.")
    }
  }
});

var processDeposit = function(depositId) {
  var deposit = Mart.Deposits.findOne(depositId)

  Mart.update(depositId, {$set: {
    state: Deposit.STATES.PROCESSING_SHOPPER,
  }})
  refundToShopper(deposit);

  Mart.update(depositId, {$set: {
    state: Deposit.STATES.PROCESSING_LANDLORD,
  }})
  transferToLandlord(deposit);

  Mart.update(depositId, {$set: {
    state: Deposit.STATES.PROCESSED,
  }})

}

var transferToLandlord = function(deposit) {
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

}

var refundToShopper = function(deposit) {

}
