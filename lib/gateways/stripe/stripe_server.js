_.extend(Mart.GatewayTypes.Stripe, {
  retrieveAccountInfo: function(options) {
    secretKey = options.secretKey || Meteor.settings.StripeSecretKey
    Stripe = StripeAPI(secretKey);
    var retrieveAccount = Meteor.wrapAsync(Stripe.accounts.retrieve, Stripe.accounts);
    try {
      var result = retrieveAccount();

      accountAttrs = {
        gatewayType: "Stripe",
        businessName: result.business_name,
        businessURL: result.business_url,
        detailsSubmitted: result.details_submitted,
        chargesEnabled: result.charge_enabled,
        transfersEnabled: result.transfer_enabled
      }

      Mart.Gateways.upsert({}, {$set: accountAttrs})
      return Mart.Gateways.findOne()._id
    } catch (error) {
      throw new Meteor.Error("stripe-charge-error", error.message);
    }
  },
})

// _.extend(Mart.GatewayTypes.Stripe, {
//   currency: "usd",
//   requiredFieldsMatch: {
//     secretKeyLookup: String,
//     name: String
//   },
//   optionalFieldsMatch: {
//     secretKey: Match.Optional(String),
//   },
//   requiredFields:  {
//     secretKeyLookup: "MartStripePrivateKey",
//   },
//   retrieveAccountInfo: function(contract) { // assume contract exists
//     // console.log("retrieveAccountInfo " + contract.secretKey + " / " +
//       // contract.secretKeyLookup + " / " + Meteor.settings[contract.secretKeyLookup]);
//
//     var error, accountAttrs,
//         apiKey = contract.secretKey || Meteor.settings[contract.secretKeyLookup]
//         Stripe = StripeAPI(apiKey),
//         retrieveAccount = Meteor.wrapAsync(Stripe.accounts.retrieve, Stripe.accounts)
//
//     try {
//       var result = retrieveAccount();
//
//       accountAttrs = {
//         businessName: result.business_name,
//         businessURL: result.business_url,
//         detailsSubmitted: result.details_submitted,
//         chargesEnabled: result.charge_enabled,
//         transfersEnabled: result.transfer_enabled
//       }
//       _.extend(contract, accountAttrs)
//       Mart.Contracts.upsert({name: contract.name}, {$set: accountAttrs})
//     } catch (error) {
//       throw new Meteor.Error("stripe-charge-error", error.message);
//     }
//     return accountAttrs
//   },
// })
//
// Meteor.methods({
//   'mart/stripe/create-card': function(stripeToken, card) {
//     check(card, Object)
//     check(stripeToken, String)
//
//     var existingCustomer = Mart.Gateways.Stripe.Customers.findOne({userId: Meteor.userId()}),
//         customerToken
//
//     // Stripe cards must be added to a customer, see if one exists
//     if(existingCustomer) {
//       console.log("existingCustomer");
//       customerToken = existingCustomer.stripeId
//     } else {
//       console.log("noi existingCustomer");
//       // Customer for this user does noes exist, create one
//       var Stripe = StripeAPI(secretKey);
//       var createCustomer = Meteor.wrapAsync(Stripe.customers.create, Stripe.customers);
//
//       try {
//         // Create on Stripe
//         var result = createCustomer({description: "Customer for user " + this.userId});
//         console.log("createCustomer");
//         customerToken = result.id
//     //
//     //     // Create in Collection
//     //     Mart.GatewayTypes.Stripe.Customers.insert({stripeToken: customerToken})
//       } catch (error) {
//         console.log(error.message);
//     //     throw new Meteor.Error("stripe-customer-create-error", error.message);
//       }
//     }
//     //
//     // var createSource = Meteor.wrapAsync(Stripe.customers.createSource, Stripe.customers);
//     // try {
//     //   // Add Card to Stripe
//     //   var result = createSource(customerToken, {source: stripeToken});
//     //   card["gatewayToken"] = response.id
//     //
//     //   // Add Card to Collection
//     //   return Mart.Cards.insert(card)
//     // } catch (error) {
//     //   throw new Meteor.Error("stripe-customer-source-error", error.message);
//     // }
//     return "mart"
//   }
// });
