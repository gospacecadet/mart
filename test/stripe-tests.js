var contract = {secretKey: "sk_test_vadeqmFcA1SDxYHoX0KeJWwe"}
var card = {
  "number": '4242424242424242',
  "exp_month": 12,
  "exp_year": 2016,
  "cvc": '123'
}

if(Meteor.isServer){
  Tinytest.add('Stripe - retrieve-account-info', function (test) {
    var expected = {
        processorName: "Stripe",
        businessName: "SpaceCadet Fleet, Inc",
        businessURL: "spacecadet.io",
        detailsSubmitted: true,
        chargesEnabled: true,
        transfersEnabled: true
      }

    var info = Mart.Stripe.retrieveAccountInfo(contract)
    test.equal(info, expected)
  })
}
if(Meteor.isClient) {
  testAsyncMulti('Stripe - create-card', [
    function(test, expect) {
      console.log("hwey man")
      var expected = [
        'brand', 'token', 'last4',
        'exp_month', 'exp_year'
      ].sort()
      Mart.Stripe.setPublishableKey("pk_test_cUA2GkVEAZpwSRZk3DilRcTR")
      Mart.Stripe.createCardToken(contract, card,
        // test that all the keys are there
        expect(function(err, response) {
          console.log(response)
          // get the keys of the card response from Stripe
          // returns an array
          // test that all the keys are there
          var respCardKeys = _.keys(response.card)//.push('token'),
          respCardKeys.push('token')
          respCardKeys = respCardKeys.sort()
          var intersection = _.intersection(respCardKeys, expected)
          var haveMinInter = _.difference(intersection, expected)
          haveMinInter = (haveMinInter.length === 0)

          //TODO values should match too

          test.isTrue(haveMinInter)
        })
      )
    },
  ])
}
