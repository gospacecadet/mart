Mart.GatewayTypes.Test = {
  currency: "usd",
  gatewayType: "Test",
  requiredFieldsMatch: {
    name: String
  },
  optionalFieldsMatch: {
  },
  requiredFields:  {
  },
  retrieveAccountInfo: function(contract) { // assume contract exists
    accountAttrs = {
      businessName: "Test Gateway Business Name",
      businessURL: "example.com",
      detailsSubmitted: false,
      chargesEnabled: false,
      transfersEnabled: false
    }

    Mart.Contracts.upsert({name: contract.name}, {$set: accountAttrs})
    return accountAttrs
  },
}
