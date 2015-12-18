var expectedAccountInfo = {
  // SpaceCadet
  // businessName: "SpaceCadet Fleet, Inc",
  // businessURL: "spacecadet.io",
  // detailsSubmitted: true,
  // chargesEnabled: true,
  // transfersEnabled: true,
  // MA Stripe Tester - marvin@unplugged.im
  businessName: "Test Stripe Joint",
  businessURL: "teststripejoint.com",
  detailsSubmitted: false,
  chargesEnabled: false,
  transfersEnabled: false,
}

Tinytest.addAsync('Gateways - Stripe - update-gateway-info', function(test, done) {
  Meteor.call('mart/update-gateway-info',
    "Stripe", function(err, result) {
      test.isUndefined(err, "Unable to sucessfully update the gateway's info")

      if(Meteor.isServer)
        checkGateway()

      if(Meteor.isClient)
        Meteor.subscribe('mart/gateways', checkGateway)

      function checkGateway() {
        gateway = Mart.Gateways.findOne()
        test.equal(gateway.businessName, expectedAccountInfo.businessName)
        test.equal(gateway.businessURL, expectedAccountInfo.businessURL)
        test.equal(gateway.detailsSubmitted, expectedAccountInfo.detailsSubmitted)
        test.equal(gateway.chargesEnabled, expectedAccountInfo.chargesEnabled)
        test.equal(gateway.transfersEnabled, expectedAccountInfo.transfersEnabled)
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

if(Meteor.isServer){
  Mart.GatewayTypes.Stripe.Customers.remove({})
}

if(Meteor.isClient) {
  Tinytest.addAsync('Gateways - Stripe - create-card', function(test, done) {
    var expectedCard, userId, cardId

    testLogout(test, function() {
      testLogin([Mart.ROLES.GLOBAL.SHOPPPER], test, onUser1LoggedIn)
    })

    function onUser1LoggedIn(err) {
      test.isUndefined(err, 'Unexpected error logging in as user1');
      userId = Meteor.userId()
      Mart.Card.createCard("Stripe", card, function(err, cId) {
        cardId = cId
        test.isUndefined(err, 'Unexpected error CREATING CARD:');
        Meteor.subscribe('mart/cards', onCardsReady)
      })
    }

    function onCardsReady() {
      test.equal(Mart.Cards.find().count(), 1)
      expectedCard = Mart.Cards.findOne(cardId)
      test.equal(expectedCard.last4, 4242)
      test.equal(expectedCard.expMonth, 10)
      test.equal(expectedCard.expYear, 2019)
      test.equal(expectedCard.nameOnCard, "Marvin Arnold")
      test.equal(expectedCard.brand, "Visa")

      done();
    }
  })
}
