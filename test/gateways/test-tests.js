Tinytest.addAsync('Gateways - Test - mart/update-gateway-info', function(test, done) {
  Meteor.call('mart/update-gateway-info', "Test", {}, function(err, gatewayId) {
    test.isUndefined(err, "Unable to sucessfully update the gateway's info: ")

    if(Meteor.isServer)
      checkGateway()

    if(Meteor.isClient)
      Meteor.subscribe('mart/gateways', checkGateway)

    function checkGateway() {
      gateway = Mart.Gateways.findOne(gatewayId)
      test.equal(gateway.businessName, "Test Gateway Business Name")
      test.equal(gateway.businessURL, "example.com")
      test.isFalse(gateway.detailsSubmitted)
      test.isFalse(gateway.chargesEnabled)
      test.isFalse(gateway.transfersEnabled)
      done()
    }
  })
})
