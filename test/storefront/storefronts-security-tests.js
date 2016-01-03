//Storefronts
  // Security
    // - [Visitor] cannot [CUD] (Create, Update, Destroy) Storefronts
    // - [Shopper] cannot [CUD] Storefronts
    // - [Rep] can only [insert, update] only [name, description, repId, isDeleted, isPublished]
    // - [Admin] can only [insert, update] only [name, description, repId, isDeleted, isPublished]
    // - [Merchant] can only [insert, update] only [name, description, isDeleted, isPublished]

Tinytest.addAsync('Storefronts - Security - Visitors cannot CUD Storefronts', function(test, done) {
  let expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: true,
    userId: "hacker"
  }
  let createdStorefrontId
  testLogout(test, begin)

  function begin() {
    Mart.Storefronts.insert(_.clone(expectedStorefront), onStorefrontInsertedVisitor)
  }

  // Visitors can't create
  function onStorefrontInsertedVisitor(error, response) {
    test.isNotUndefined(error)
    // done()
    quickStorefront(expectedStorefront, test, onStorefrontInsertedMerchant)
  }

  function onStorefrontInsertedMerchant(error, response) {
    createdStorefrontId = response
    Mart.Storefronts.update(createdStorefrontId, {$set: {name: "BlAh"}}, onStorefrontUpdated)
  }

  // Visitors can't update
  function onStorefrontUpdated(error, response) {
    test.isNotUndefined(error)

    Mart.Storefronts.remove(createdStorefrontId, onStorefrontRemoved)
  }

  // Visitors can't remove
  function onStorefrontRemoved(error, response) {
    test.isNotUndefined(error)

    done()
  }
})

Tinytest.addAsync('Storefronts - Security - Shoppers cannot CUD Storefronts', function(test, done) {
  let expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: true,
    userId: "hacker"
  }
  let createdStorefrontId

  quickStorefront(expectedStorefront, test, onStorefrontInsertedMerchant)

  function onStorefrontInsertedMerchant(error, response) {
    createdStorefrontId = response

    testLogin([Mart.ROLES.GLOBAL.SHOPPER], test, onUserLoggedIn)
  }

  function onUserLoggedIn(error) {
    Mart.Storefronts.insert(_.clone(expectedStorefront), onStorefrontInsertedShopper)
  }

  // Shoppers can't create
  function onStorefrontInsertedShopper(error, response) {
    test.isNotUndefined(error)

    Mart.Storefronts.update(createdStorefrontId, {$set: {name: "BlAh"}}, onStorefrontUpdated)
  }

  // Shoppers can't update
  function onStorefrontUpdated(error, response) {
    test.isNotUndefined(error)

    Mart.Storefronts.remove(createdStorefrontId, onStorefrontRemoved)
  }

  // Shoppers can't remove
  function onStorefrontRemoved(error, response) {
    test.isNotUndefined(error)

    done()
  }
})

_.each([
  Mart.ROLES.GLOBAL.REP,
  Mart.ROLES.GLOBAL.ADMIN
], function(role) {
  Tinytest.addAsync('Storefronts - Security - ' + role + ' can only [insert, update] only [name, description, repId, isDeleted, isPublished]', function(test, done) {
    let merchantId, expectedStorefront, storefrontId
    let roles = [Mart.ROLES.GLOBAL.REP]

    testLogout(test, begin)

    function begin() {
      testLogin([role], test, createStorefront)
    }

    function createStorefront() {
      Mart.Storefronts.insert({
        name: "some Storefront",
        description: "woot there it is",
        address: "123 Fake St",
        city: "New Orleans",
        state: "LA",
        zip: "70113",
        isPublished: true,
        isDeleted: false,
        userId: "merchantId",
      }, onStorefrontInserted)
    }

    var sub1
    function onStorefrontInserted(error, storeId) {
      storefrontId = storeId
      test.isUndefined(error, "Could not create test storefront")
      test.isTrue(typeof storefrontId === "string")

      sub1 = Meteor.subscribe("mart/storefront", storefrontId, onStorefrontSubscribed)
    }

    function onStorefrontSubscribed() {
      let storefront = Mart.Storefronts.findOne(storefrontId)

      test.equal(storefront.repId, Meteor.userId())
      test.equal(storefront.userId, "merchantId")

      Mart.Storefronts.update(storefrontId, {$set: {
        name: "sasdfasdf",
        description: "asdfasdfsadf",
        isPublished: false,
        userId: "useadfsdfrId",
        repId: "repId"
      }}, onStorefrontUpdated)
    }

    function onStorefrontUpdated(error, response) {
      test.isUndefined(error)

      let storefront = Mart.Storefronts.findOne(storefrontId)
      test.equal(storefront.name, "sasdfasdf")
      test.equal(storefront.description, "asdfasdfsadf")

      // Admins can set repId but reps cannot
      if(role === Mart.ROLES.GLOBAL.ADMIN) {
        test.equal(storefront.repId, "repId")
      } else {
        test.equal(storefront.repId, Meteor.userId())
      }

      test.equal(storefront.userId, "merchantId")

      Mart.Storefronts.remove(storefrontId, onStorefrontRemoved)
    }

    function onStorefrontRemoved(error, response) {
      test.isNotUndefined(error)

      sub1.stop()
      done()
    }
  })
})
