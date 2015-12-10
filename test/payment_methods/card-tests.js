Tinytest.addAsync('Card - Shopper - subscribe', function(test, done) {
  testLogout(test, function() {
    testLogin([Mart.ROLES.GLOBAL.SHOPPER], test, onUser1LoggedIn)
  })

  var sub1
  function onUser1LoggedIn() {
    var card = {
      last4: 1234,
      expMonth: 11,
      expYear: 2019,
      nameOnCard: "Marvin Arnold",
      brand: "Visa",
      gatewayToken: "testToken",
      gateway: "Test"
    }

    Mart.Cards.insert(card, function(error, cardId) {
      test.isUndefined(error, 'Unexpected error inserting card');
      sub1 = Meteor.subscribe('mart/cards', Mart.guestId(), onCardsReady)
    })
  }

  function onCardsReady() {
    var card = Mart.Cards.findOne()
    test.equal(card.last4, 1234)
    test.equal(card.expMonth, 11)
    test.equal(card.expYear, 2019)
    test.equal(card.nameOnCard, "Marvin Arnold")
    test.equal(card.brand, "Visa")
    test.isUndefined(card.gatewayToken)
    test.isUndefined(card.gateway)
    test.equal(Mart.Cards.find().count(), 1)

    sub1.stop()
    done();
  }
})

Tinytest.addAsync('Card - Guest - subscribe', function(test, done) {
  Mart.resetGuestId()
  testLogout(test, onUser1LoggedIn)

  var sub1
  function onUser1LoggedIn() {
    var card = {
      last4: 1234,
      expMonth: 11,
      expYear: 2019,
      nameOnCard: "Marvin Arnold",
      brand: "Visa",
      gatewayToken: "testToken",
      gateway: "Test",
      guestId: Mart.guestId()
    }

    Mart.Cards.insert(card, function(error, cardId) {
      test.isUndefined(error, 'Unexpected error inserting card');
      sub1 = Meteor.subscribe('mart/cards', Mart.guestId(), onCardsReady)
    })
  }

  function onCardsReady() {
    var card = Mart.Cards.findOne()
    test.equal(card.last4, 1234)
    test.equal(card.expMonth, 11)
    test.equal(card.expYear, 2019)
    test.equal(card.nameOnCard, "Marvin Arnold")
    test.equal(card.brand, "Visa")
    test.isUndefined(card.gatewayToken)
    test.isUndefined(card.gateway)
    test.equal(Mart.Cards.find().count(), 1)

    sub1.stop()
    done();
  }
})
