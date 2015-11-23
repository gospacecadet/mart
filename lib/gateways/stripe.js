Mart.Stripe = {
  secretKey: "MartStripeSecretKey",
  getAccountInfo: function(key) {
    return Meteor.call("mart/stripe/getAccountInfo", key);
  }
}

// if(Meteor.isClient) {
//   Meteor.startup(function() {
//       Stripe.setPublishableKey('YOUR_PUBLISHABLE_KEY');
//   });
// }

if(Meteor.isServer) {
  Meteor.methods({
    'mart/stripe/getAccountInfo': function(key) {
      var error, paymentProcessorAttrs;
      var Stripe = StripeAPI(key);
      var retrieveAccount = Meteor.wrapAsync(Stripe.accounts.retrieve, Stripe.accounts);

      try {
        var result = retrieveAccount();

        paymentProcessorAttrs = {
          processorName: "Stripe",
          businessName: result.business_name,
          businessURL: result.business_url,
          detailsSubmitted: result.details_submitted,
          chargesEnabled: result.charge_enabled,
          transfersEnabled: result.transfer_enabled
        }
      } catch (error) {
        error = new Meteor.Error("stripe-charge-error", error.message);
      }
      return paymentProcessorAttrs
    }
  });
}
