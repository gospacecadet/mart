Mart.Stripe = {
  currency: "usd",
  requiredFieldsMatch: {
    secretKeyLookup: String,
  },
  optionalFieldsMatch: {
    secretKey: Match.Optional(String)
  },
  requiredFields:  {
    secretKeyLookup: "MartStripeSecretKey",
  },
  retrieveAccountInfo: function(contract) { // assume contract exists
    var error, accountAttrs,
        apiKey = contract.secretKey || Meteor.settings[contract.secretKeyLookup]
        Stripe = StripeAPI(apiKey),
        retrieveAccount = Meteor.wrapAsync(Stripe.accounts.retrieve, Stripe.accounts)

    try {
      var result = retrieveAccount();

      accountAttrs = {
        processorName: "Stripe",
        businessName: result.business_name,
        businessURL: result.business_url,
        detailsSubmitted: result.details_submitted,
        chargesEnabled: result.charge_enabled,
        transfersEnabled: result.transfer_enabled
      }
    } catch (error) {
      throw new Meteor.Error("stripe-charge-error", error.message);
    }
    return accountAttrs
  }
}

// if(Meteor.isClient) {
//   Meteor.startup(function() {
//     Stripe.setPublishableKey('YOUR_PUBLISHABLE_KEY');
//   });
// }
