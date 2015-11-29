Mart.GatewayTypes.Stripe = {
  getSecretKey: function(options) {
    return options.secretKey || Meteor.settings.StripeSecretKey
  },
  getPublicKey: function(options) {
    return options.publicKey || Meteor.settings.public.StripePublicKey
  },
}
