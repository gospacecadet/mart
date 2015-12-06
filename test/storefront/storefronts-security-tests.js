//Storefronts
  // Security
    // - Visitors cannot CUD Storefronts
//[rep] can [create, update, deactivate] stores on behalf of merchants only
//[admin] can [create, update, deactivate, delete stores]
//[roles] can't be changed by anybody

Tinytest.addAsync('Storefronts - Security - Visitors cannot CUD Storefronts', function(test, done) {
  let expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: true,
    userId: "hacker"
  }
  let createdStorefrontId

  Mart.Storefronts.insert(_.clone(expectedStorefront), onStorefrontInsertedVisitor)

  // Visitors can't create
  function onStorefrontInsertedVisitor(error, response) {
    test.isNotUndefined(error)
    test.isFalse(response)

    createTestStorefront(test, onStorefrontInsertedMerchant)
  }

  function onStorefrontInsertedMerchant(error, response) {
    createdStorefrontId = response.storefrontId
    Mart.Storefronts.update(createdStorefrontId, {$set: {name: "BlAh"}}, onStorefrontUpdated)
  }

  // Visitors can't update
  function onStorefrontUpdated(error, response) {
    test.isNotUndefined(error)
    test.isFalse(response)

    Mart.Storefronts.remove(createdStorefrontId, onStorefrontRemoved)
  }

  // Visitors can't remove
  function onStorefrontRemoved(error, response) {
    test.isNotUndefined(error)
    test.isFalse(response)

    done()
  }

})
