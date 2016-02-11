Mart.GatewayTypes.Stripe = {
  getSecretKey: function(options) {
    return options.secretKey || Mart.STRIPE_SECRET_KEY
  },
  getPublicKey: function(options) {
    return options.publicKey || Mart.STRIPE_PUBLIC_KEY.StripePublicKey
  },
  TYPE_ON_GATEWAY: {
    INDIVIDUAL: "individual",
    COMPANY: "company"
  }
}
