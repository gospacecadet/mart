if(Meteor.isServer){
  var name = 'testGateway' + new Date().getTime()
  Mart.createGateway(name, Mart.GatewayTypes.Test)
  testAsyncMulti('gateway/test - get-account-info', [
    function(test, expect) {
      Meteor.call('mart/update-gateway-info', name, expect(function(err, gatewayId) {
        if(err)
          return test.isTrue(false, "Unable to sucessfully update the gateway's info: " + err.message)

        var gateway = Mart.Gateways.findOne(gatewayId)
        test.equal(gateway.businessName, "Test Gateway Business Name")
        test.equal(gateway.businessURL, "example.com")
        test.isFalse(gateway.detailsSubmitted)
        test.isFalse(gateway.chargesEnabled)
        test.isFalse(gateway.transfersEnabled)
      }))
    }
  ])

}
