if(Meteor.isClient) {
  testAsyncMulti('Merchant - createMerchant', [
    function(test, expect) {
      var expectedMerchant = {
        name: "some Merchant",
        description: "woot there it is",
        isActive: true
      }

      Mart.Merchant.create(expectedMerchant,
        expect(function(err, response) {
          // response should be the _id
          test.isNotNull(response)
          var merchant1 = Mart.Merchants.findOne(response)
          test.isNotNull(merchant1)

          var merchant2 = Mart.Merchants.findOne(expectedMerchant)
          test.isNotNull(merchant2)
        })
      )
    },
  ])
}
