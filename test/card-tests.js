var card = {
  last4: 1234,
  expMonth: 11,
  expYear: 2019,
  nameOnCard: "Marvin Arnold",
  brand: "Visa",
  gatewayToken: "testToken"
}

if (Meteor.isClient) {
  Tinytest.addAsync('Card - subscribe', function(test, done) {
    loginWCallback(test, onUser1LoggedIn)

    function onUser1LoggedIn(err) {
      test.isUndefined(err, 'Unexpected error logging in as user1');

      Mart.Cards.insert(card, function(error, cardId) {
        test.isUndefined(error, 'Unexpected error inserting card');
        Meteor.subscribe('mart/cards', onCardsReady)
      })
    }

    function onCardsReady() {
      test.equal(Mart.Cards.find().count(), 1)
      var expectedCard = Mart.Cards.findOne()
      test.equal(expectedCard.last4, 1234)
      test.equal(expectedCard.expMonth, 11)
      test.equal(expectedCard.expYear, 2019)
      test.equal(expectedCard.nameOnCard, "Marvin Arnold")
      test.equal(expectedCard.brand, "Visa")
      done();
    }
  })
}
