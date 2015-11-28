if(Meteor.isServer) {
  var name = 'testGateway' + new Date().getTime()
  Mart.createGateway(name, Mart.GatewayTypes.Test)
  testAsyncMulti('GatewayTypes::Test - get-account-info', [
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
    },
  ])
}

var card = {
  nameOnCard: "Marvin Arnold",
  expMonth: 10,
  expYear: 2019,
  cvc: 123,
  number: 4242424242424242
}

if(Meteor.isClient) {
  Tinytest.addAsync('GatewayTypes::Test - create-card', function(test, done) {
    loginWCallback(test, onUser1LoggedIn)

    function onUser1LoggedIn(err) {
      test.isUndefined(err, 'Unexpected error logging in as user1');
      Mart.Card.createCard(Mart.GatewayTypes.Test, card, function(err, cardId) {
        test.isUndefined(err, 'Unexpected error CREATING CARD');
        Meteor.subscribe('cards', onCardsReady)
      })
    }

    function onCardsReady() {
      test.equal(Mart.Cards.find().count(), 1)
      var expectedCard = Mart.Cards.findOne()
      test.equal(expectedCard.last4, 4242)
      test.equal(expectedCard.expMonth, 10)
      test.equal(expectedCard.expYear, 2019)
      test.equal(expectedCard.nameOnCard, "Marvin Arnold")
      test.equal(expectedCard.brand, "Visa")
      done();
    }
  })
}
