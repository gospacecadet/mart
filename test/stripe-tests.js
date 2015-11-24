if(Meteor.isServer) {
  var testContractName = "testStripeContract" + Math.floor(Math.random() * 100000000),
      expected = {
        processorName: "Stripe",
        businessName: "SpaceCadet Fleet, Inc",
        businessURL: "spacecadet.io",
        detailsSubmitted: true,
        chargesEnabled: true,
        transfersEnabled: true
      },
      contract = {secretKey: "sk_test_vadeqmFcA1SDxYHoX0KeJWwe"}
  Tinytest.add('Stripe - retrieve-account-info', function (test) {
    test.equal(Mart.Stripe.retrieveAccountInfo(contract), expected)
  })
  // testAsyncMulti('Stripe - retrieve-account-info', [
  //   function(test, expect) {
  //     console.log("test async for " + testContractName)
  //     Meteor.call('mart/retrieve-account-info', testContractName, expect(function(err, resp) {
  //       test.equal(resp, expected)
  //       // test.isTrue(true)
  //     }))
  //
  //   }
  // ])
}
