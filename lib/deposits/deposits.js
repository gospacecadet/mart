Deposit = {
  STATES: {
    PENDING: 'deposit-state-pending',
    PROCESSING_SHOPPER: 'deposit-state-processing-shopper',
    PROCESSING_MERCHANT: 'deposit-state-processing-merchant',
    PROCESSED: 'deposit-state-processed',
  }
}

Mart.Deposits = new Mongo.Collection("MartDeposits");

Mart.Deposits.attachSchema(new SimpleSchema({
  cartId: {
    type: String
  },
  shopperId: {
    type: String
  },
  merchantId: {
    type: String
  },
  amountInCents: {
    type: String
  },
  state: {
    type: String,
    alloweValues: [
      Deposit.STATES.PENDING,
      Deposit.STATES.PROCESSING_SHOPPER,
      Deposit.STATES.PROCESSING_MERCHANT,
      Deposit.STATES.PROCESSED
    ]
  },
  paidToShopper: {
    type: Number,
    optional: true
  },
  paidToShopperAt: {
    type: Date,
    optional: true
  },
  paidToShopperConfirmation: {
    type: String,
    optional: true
  },
  paidToMerchant: {
    type: Number,
    optional: true,
    custom: function() {
      var paidToShopper = this.field('paidToShopper').value
      var amountToPay = this.value + paidToShopper

      var total = this.field('amountInCents').value

      if (amountToPay !== total) {
        return "invalidTotal";
      }
    }
  },
  paidToMerchantAt: {
    type: Date,
    optional: true
  },
  paidToMerchantConfirmation: {
    type: String,
    optional: true
  }
}
