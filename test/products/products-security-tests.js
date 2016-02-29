_.each([
  Mart.ROLES.GLOBAL.MERCHANT,
  Mart.ROLES.GLOBAL.REP,
  Mart.ROLES.GLOBAL.ADMIN
], function(role) {
  Tinytest.addAsync('Products - Security - [' + role + '] can [insert, update]', function(test, done) {
    var storefrontId, productId

    testLogout(test, begin)

    function begin() {
      testLogin([role], test, function() {
        // This userId will only be used if Admin or Rep
        createTestStorefront({userId: "fakeId"}, test, createProduct)
      })
    }

    var sub1
    function createProduct(error, response) {
      storefrontId = response
      createTestProduct({
        storefrontId: storefrontId,
        isPublished: false,
        isDeleted: false
      }, test, function(error, response) {
        productId = response
        sub1 = Meteor.subscribe('mart/storefront', storefrontId, function() {
          var product = Mart.Products.findOne(productId)
          test.equal(product.storefrontId, storefrontId)
          test.equal(product.name, "asd;skdf sdf")
          test.equal(product.description, "a;sldfjkas;dlf")
          test.isFalse(product.isPublished)
          test.isFalse(product.isDeleted)

          Mart.Products.update(productId, {$set: {name: "hotness"}}, onUpdate)
        })
      })
    }

    var sub2
    function onUpdate(error, response) {
      sub2 = Meteor.subscribe('mart/storefront', storefrontId, function() {
        var product = Mart.Products.findOne(productId)
        test.equal(product.name, "hotness")

        Mart.Products.remove(productId, function(error, response) {
          test.isNotUndefined(error) // should not be allowed to delete

          sub1.stop()
          sub2.stop()
          done()
        })
      })
    }
  })
})
