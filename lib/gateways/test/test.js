Mart.GatewayTypes.Test = {
  currency: "usd",
  gatewayType: "Test",
  requiredFieldsMatch: {
    name: String
  },
  optionalFieldsMatch: {
  },
  requiredFields:  {
    // have to explicitly give it a name
  },
  retrieveAccountInfo: function(gateway) { // assume contract exists
    accountAttrs = {
      businessName: "Test Gateway Business Name",
      businessURL: "example.com",
      detailsSubmitted: false,
      chargesEnabled: false,
      transfersEnabled: false
    }

    Mart.Gateways.upsert({name: gateway.name}, {$set: accountAttrs})
    return accountAttrs
  },
}
