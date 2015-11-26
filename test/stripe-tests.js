var name = 'alibaba' + new Date().getTime()
var contract = {
  secretKey: "sk_test_vadeqmFcA1SDxYHoX0KeJWwe",
  name: name
}

if(Meteor.isServer){
  Tinytest.add('Stripe - retrieve-account-info', function (test) {
    Mart.createContract(contract.name, Mart.Stripe)

    var expected = {
        businessName: "SpaceCadet Fleet, Inc",
        businessURL: "spacecadet.io",
        detailsSubmitted: true,
        chargesEnabled: true,
        transfersEnabled: true
      }

    var info = Mart.Stripe.retrieveAccountInfo(contract)
    test.equal(info, expected)

    expected["processorName"] = "Stripe"
    expected["name"] = contract.name
    var contracts = Mart.Contracts.find(expected)
    test.isTrue(contracts.count() === 1)
  })
}
if(Meteor.isClient) {
  testAsyncMulti('Stripe - createCardToken', [
    function(test, expect) {
      var card = {
        "number": '4242424242424242',
        "exp_month": 12,
        "exp_year": 2016,
        "cvc": '123'
      }

      var expected = [
        'brand', 'token', 'last4',
        'exp_month', 'exp_year'
      ].sort()
      Mart.Stripe.setPublishableKey("pk_test_cUA2GkVEAZpwSRZk3DilRcTR")
      Mart.Stripe.createCardToken(contract, card,
        // test that all the keys are there
        expect(function(err, response) {
          // console.log(response)
          // get the keys of the card response from Stripe
          // returns an array
          // test that all the keys are there
          var respCardKeys = _.keys(response)//.push('token'),

          respCardKeys = respCardKeys.sort()
          var intersection = _.intersection(respCardKeys, expected)
          var haveMinInter = _.difference(intersection, expected)
          haveMinInter = (haveMinInter.length === 0)

          // test that all the keys are there
          test.isTrue(haveMinInter)

          // token is a string that starts with tok
          response.token.match(/^tok.*/)

          // brand is visa + last fours are 4242
          test.equal(response.brand, "Visa")
          test.equal(response.last4, "4242")

          // month and year match
          test.equal(response.exp_month, card.exp_month)
          test.equal(response.exp_year, card.exp_year)

        })
      )
    },
  ])
}
