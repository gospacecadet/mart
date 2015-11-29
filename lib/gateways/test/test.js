Mart.GatewayTypes.Test = {
  retrieveAccountInfo: function(options) {
    accountAttrs = {
      gatewayType: "Test",
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
