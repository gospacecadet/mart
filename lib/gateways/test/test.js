Mart.GatewayTypes.Test = {
  retrieveAccountInfo: function(options) { // assume contract exists
    accountAttrs = {
      businessName: "Test Gateway Business Name",
      businessURL: "example.com",
      detailsSubmitted: false,
      chargesEnabled: false,
      transfersEnabled: false
    }

    Mart.Gateways.upsert({}, {$set: accountAttrs})
    return Mart.Gateways.findOne()._id
  },
}
