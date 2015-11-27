_.extend(Mart.Stripe, {
  currency: "usd",
  requiredFieldsMatch: {
    secretKeyLookup: String,
    name: String
  },
  optionalFieldsMatch: {
    secretKey: Match.Optional(String),
  },
  requiredFields:  {
    secretKeyLookup: "MartStripePrivateKey",
  },
  retrieveAccountInfo: function(contract) { // assume contract exists
    // console.log("retrieveAccountInfo " + contract.secretKey + " / " +
      // contract.secretKeyLookup + " / " + Meteor.settings[contract.secretKeyLookup]);

    var error, accountAttrs,
        apiKey = contract.secretKey || Meteor.settings[contract.secretKeyLookup]
        Stripe = StripeAPI(apiKey),
        retrieveAccount = Meteor.wrapAsync(Stripe.accounts.retrieve, Stripe.accounts)

    try {
      var result = retrieveAccount();

      accountAttrs = {
        businessName: result.business_name,
        businessURL: result.business_url,
        detailsSubmitted: result.details_submitted,
        chargesEnabled: result.charge_enabled,
        transfersEnabled: result.transfer_enabled
      }
      _.extend(contract, accountAttrs)
      Mart.Contracts.upsert({name: contract.name}, {$set: accountAttrs})
    } catch (error) {
      throw new Meteor.Error("stripe-charge-error", error.message);
    }
    return accountAttrs
  },

})
