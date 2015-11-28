if(Meteor.isServer) {
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
    },
  ])
}

if (Meteor.isClient) {
  Tinytest.addAsync('gateway/test - create-card', function(test, done) {
    var username1 = 'testuser1-' + Random.id();
    var password1 = 'password1-' + Random.id();
    var card = {
      nameOnCard: "Marvin Arnold",
      expMonth: 10,
      expYear: 2019,
      cvc: 123,
      number: 4242424242424242
    }
    console.log("Attempting log in");
    loginAsUser1();
    console.log("Logged in");

    function loginAsUser1() {
      Accounts.createUser({
        username: username1,
        password: password1
      }, onUser1LoggedIn);
    }

    function onUser1LoggedIn(err) {
      console.log("onUser1LoggedIn");
      test.isUndefined(err, 'Unexpected error logging in as user1');

      Meteor.subscribe('cards', )

      Mart.Card.createCard(Mart.GatewayTypes.Test, card, function(err, cardId) {
        console.log("onUser1LoggedIn#callback " + cardId);
        test.isUndefined(err, 'Unexpected error CREATING CARD:' + err.message);

        var card = Mart.Cards.findOne(cardId)
        test.equal(card.last4, 4242424242424242)
        test.equal(card.expMonth, 10)
        test.equal(card.expYear, 2019)
        test.equal(card.nameOnCard, "Marvin Arnold")
        test.equal(card.brand, "Visa")
        done();
      })
    }
  })
}

//
// if(Meteor.isClient){
//   testAsyncMulti('gateway/test - create-card', [
//     function(test, expect) {
//       Mart.Card.createCard(
//         Mart.GatewayTypes.Test,
//         {
//           nameOnCard: "Marvin Arnold",
//           expMonth: 10,
//           expYear: 2019,
//           cvc: 123,
//           number: 4242424242424242
//         },
//         expect(function(err, cardId) {
//           if(err)
//             return test.isTrue(false, "Unable to sucessfully create the card: " + err.message)
//
//           var card = Mart.Cards.findOne(cardId)
//           test.equal(card.last4, 4242)
//           test.equal(card.expMonth, 10)
//           test.equal(card.expYear, 19)
//           test.equal(card.nameOncard, "Marvin Arnold")
//           test.equal(card.brand, "Visa")
//         }
//       ))
//     }
//   ])
// }
