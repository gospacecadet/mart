if(Meteor.isClient) {
  testAsyncMulti('Storefront - createStorefront', [
    function(test, expect) {
      var expectedStorefront = {
        name: "some Storefront",
        description: "woot there it is",
        isActive: true
      }

      Mart.Storefront.create(expectedStorefront,
        expect(function(err, response) {
          // response should be the _id
          test.isNotNull(response)
          var storefront1 = Mart.Storefronts.findOne(response)
          test.isNotNull(storefront1)

          var storefront2 = Mart.Storefronts.findOne(expectedStorefront)
          test.isNotNull(storefront2)
        })
      )
    },
  ])
}
