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

var card = {
  nameOnCard: "Marvin Arnold",
  expMonth: 10,
  expYear: 2019,
  cvc: 123,
  number: 4242424242424242
}

if(Meteor.isClient) {
  Tinytest.addAsync('Gateways - Test - create-card', function(test, done) {
    testLogin([Mart.ROLES.GLOBAL.SHOPPER], test, onUser1LoggedIn)

    function onUser1LoggedIn(err) {
      test.isUndefined(err, 'Unexpected error logging in as user1');
      Mart.Card.createCard("Test", card, {}, function(err, cardId) {
        test.isUndefined(err, 'Unexpected error CREATING CARD');
        Meteor.subscribe('mart/cards', onCardsReady)
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
      test.isUndefined(expectedCard.gateway)
      done();
    }
  })
}
