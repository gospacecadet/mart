var card = {
  nameOnCard: "Marvin Arnold",
  expMonth: 10,
  expYear: 2019,
  cvc: 123,
  number: 4242424242424242
}

if(Meteor.isClient) {
  Tinytest.addAsync('Gateways::Stripe - create-card', function(test, done) {
    loginWCallback(test, onUser1LoggedIn)

    function onUser1LoggedIn(err) {
      console.log("MonUser1LoggedIn");
      test.isUndefined(err, 'Unexpected error logging in as user1');

      Mart.Card.createCard(Mart.Gateways.Stripe, card, function(err, cardId) {
        console.log("McreateCard " + cardId);
        test.isUndefined(err, 'Unexpected error CREATING CARD:');
        Meteor.subscribe('mart/cards', onCardsReady)
      })
    }

    function onCardsReady() {
      console.log("MonCardsReady");
      test.equal(Mart.Cards.find().count(), 1)
      // var expectedCard = Mart.Cards.findOne()
      // test.equal(expectedCard.last4, 4242)
      // test.equal(expectedCard.expMonth, 10)
      // test.equal(expectedCard.expYear, 2019)
      // test.equal(expectedCard.nameOnCard, "Marvin Arnold")
      // test.equal(expectedCard.brand, "Visa")

      // should have created a customer
      done();
    }
  })
}
// if(Meteor.isServer){
//   Tinytest.add('Stripe - retrieve-account-info', function (test) {
//     var name = 'alibaba' + new Date().getTime()
//     var contract = {
//       secretKey: "sk_test_vadeqmFcA1SDxYHoX0KeJWwe",
//       name: name
//     }
//
//     Mart.createContract(contract.name, Mart.Stripe)
//
//     var expected = {
//         businessName: "SpaceCadet Fleet, Inc",
//         businessURL: "spacecadet.io",
//         detailsSubmitted: true,
//         chargesEnabled: true,
//         transfersEnabled: true
//       }
//
//     var info = Mart.Stripe.retrieveAccountInfo(contract)
//     test.equal(info, expected)
//
//     expected["processorName"] = "Stripe"
//     expected["name"] = contract.name
//     var contracts = Mart.Contracts.find(expected)
//     test.isTrue(contracts.count() === 1)
//   })
// }
// if(Meteor.isClient) {
//   testAsyncMulti('Stripe - createCardToken', [
//     function(test, expect) {
//       var name = 'alibaba' + new Date().getTime()
//       var contract = {
//         secretKey: "sk_test_vadeqmFcA1SDxYHoX0KeJWwe",
//         name: name
//       }
//
//       var card = {
//         "number": '4242424242424242',
//         "exp_month": 12,
//         "exp_year": 2016,
//         "cvc": '123'
//       }
//
//       var expected = [
//         'brand', 'token', 'last4',
//         'exp_month', 'exp_year'
//       ].sort()
//       Mart.Stripe.setPublishableKey("pk_test_cUA2GkVEAZpwSRZk3DilRcTR")
//       Mart.Stripe.createCardToken(contract, card,
//         // test that all the keys are there
//         expect(function(err, response) {
//           // console.log(response)
//           // get the keys of the card response from Stripe
//           // returns an array
//           // test that all the keys are there
//           var respCardKeys = _.keys(response)//.push('token'),
//
//           respCardKeys = respCardKeys.sort()
//           var intersection = _.intersection(respCardKeys, expected)
//           var haveMinInter = _.difference(intersection, expected)
//           haveMinInter = (haveMinInter.length === 0)
//
//           // test that all the keys are there
//           test.isTrue(haveMinInter)
//
//           // token is a string that starts with tok
//           response.token.match(/^tok.*/)
//
//           // brand is visa + last fours are 4242
//           test.equal(response.brand, "Visa")
//           test.equal(response.last4, "4242")
//
//           // month and year match
//           test.equal(response.exp_month, card.exp_month)
//           test.equal(response.exp_year, card.exp_year)
//
//         })
//       )
//     },
//   ])
// }
