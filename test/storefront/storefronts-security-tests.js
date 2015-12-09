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
    test.isFalse(response)
    // done()
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

Tinytest.addAsync('Storefronts - Security - Shoppers cannot CUD Storefronts', function(test, done) {
  let expectedStorefront = {
    name: "some Storefront",
    description: "woot there it is",
    isPublished: true,
    userId: "hacker"
  }
  let createdStorefrontId

  createTestStorefront(test, onStorefrontInsertedMerchant)

  function onStorefrontInsertedMerchant(error, response) {
    createdStorefrontId = response.storefrontId

    testLogin([Mart.ROLES.GLOBAL.SHOPPER], test, onUserLoggedIn)
  }

  function onUserLoggedIn(error) {
    Mart.Storefronts.insert(_.clone(expectedStorefront), onStorefrontInsertedShopper)
  }

  // Shoppers can't create
  function onStorefrontInsertedShopper(error, response) {
    test.isNotUndefined(error)
    test.isFalse(response)

    Mart.Storefronts.update(createdStorefrontId, {$set: {name: "BlAh"}}, onStorefrontUpdated)
  }

  // Shoppers can't update
  function onStorefrontUpdated(error, response) {
    test.isNotUndefined(error)
    test.isFalse(response)

    Mart.Storefronts.remove(createdStorefrontId, onStorefrontRemoved)
  }

  // Shoppers can't remove
  function onStorefrontRemoved(error, response) {
    test.isNotUndefined(error)
    test.isFalse(response)

    done()
  }
})

Tinytest.addAsync('Storefronts - Security - [Rep] can only [insert, update] only [name, description, repId, isDeleted, isPublished]', function(test, done) {
  let merchantId, expectedStorefront, storefrontId
  let roles = [Mart.ROLES.GLOBAL.REP]

  testLogout(test, begin)

  function begin() {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, onMerchantLoggedIn)
  }

  function onMerchantLoggedIn(error) {
    merchantId = Meteor.userId()
    test.isTrue(typeof merchantId === "string")
    testFor(roles)
  }

  function testFor() {
    testLogout(test, onMerchantLoggedOut)
  }

  function onMerchantLoggedOut(error) {
    testLogin(roles, test, onRepLoggedIn)
  }

  function onRepLoggedIn(error) {
    expectedStorefront = {
      name: "some Storefront",
      description: "woot there it is",
      isPublished: true,
      userId: merchantId,
    }

    Mart.Storefronts.insert(_.clone(expectedStorefront), onStorefrontInserted)
  }

  function onStorefrontInserted(error, storeId) {
    storefrontId = storeId
    test.isUndefined(error, "Could not create test storefront")
    test.isTrue(typeof storefrontId === "string")

    Meteor.subscribe("mart/storefront", storefrontId, onStorefrontSubscribed)
  }

  let changedStorefront = {
    name: "sasdfasdf",
    description: "asdfasdfsadf",
    isPublished: false,
    userId: "userId",
    repId: "repId"
  }

  function onStorefrontSubscribed() {
    let storefront = Mart.Storefronts.findOne(storefrontId)

    test.equal(storefront.repId, Meteor.userId())
    test.equal(storefront.userId, merchantId)

    Mart.Storefronts.update(storefrontId, {$set: changedStorefront}, onStorefrontUpdated)
  }

  function onStorefrontUpdated(error, response) {
    test.isUndefined(error)

    let storefront = Mart.Storefronts.findOne(storefrontId)
    test.equal(storefront.name, "sasdfasdf")
    test.equal(storefront.description, "asdfasdfsadf")
    test.equal(storefront.repId, Meteor.userId())
    test.equal(storefront.userId, merchantId)

    Mart.Storefronts.remove(storefrontId, onStorefrontRemoved)
  }

  function onStorefrontRemoved(error, response) {
    test.isNotUndefined(error)

    done()
  }
})

Tinytest.addAsync('Storefronts - Security - [Admin] can only [insert, update] only [name, description, repId, isDeleted, isPublished]', function(test, done) {
  let merchantId, expectedStorefront, storefrontId
  let roles = [Mart.ROLES.GLOBAL.ADMIN]

  testLogout(test, begin)

  function begin() {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, onMerchantLoggedIn)
  }

  function onMerchantLoggedIn(error) {
    merchantId = Meteor.userId()
    test.isTrue(typeof merchantId === "string")
    testFor(roles)
  }

  function testFor() {
    testLogout(test, onMerchantLoggedOut)
  }

  function onMerchantLoggedOut(error) {
    testLogin(roles, test, onRepLoggedIn)
  }

  function onRepLoggedIn(error) {
    expectedStorefront = {
      name: "some Storefront",
      description: "woot there it is",
      isPublished: true,
      userId: merchantId,
      repId: "woa"
    }

    Mart.Storefronts.insert(_.clone(expectedStorefront), onStorefrontInserted)
  }

  function onStorefrontInserted(error, storeId) {
    storefrontId = storeId
    test.isUndefined(error, "Could not create test storefront")
    test.isTrue(typeof storefrontId === "string")

    Meteor.subscribe("mart/storefront", storefrontId, onStorefrontSubscribed)
  }

  let changedStorefront = {
    name: "sasdfasdf",
    description: "asdfasdfsadf",
    isPublished: false,
    userId: "userId",
    repId: "repId"
  }

  function onStorefrontSubscribed() {
    let storefront = Mart.Storefronts.findOne(storefrontId)
    test.equal(storefront.repId, "woa")
    test.equal(storefront.userId, merchantId)

    Mart.Storefronts.update(storefrontId, {$set: changedStorefront}, onStorefrontUpdated)
  }

  function onStorefrontUpdated(error, response) {
    test.isUndefined(error)

    let storefront = Mart.Storefronts.findOne(storefrontId)
    test.equal(storefront.name, "sasdfasdf")
    test.equal(storefront.description, "asdfasdfsadf")
    test.equal(storefront.repId, "repId")
    test.equal(storefront.userId, merchantId)

    Mart.Storefronts.remove(storefrontId, onStorefrontRemoved)
  }

  function onStorefrontRemoved(error, response) {
    test.isNotUndefined(error)

    done()
  }
})

Tinytest.addAsync('Storefronts - Security - [Merchant] can only [insert, update] only [name, description, repId, isDeleted, isPublished]', function(test, done) {
  let merchantId, expectedStorefront, storefrontId
  let roles = [Mart.ROLES.GLOBAL.MERCHANT]

  testLogout(test, begin)

  function begin() {
    testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, onMerchantLoggedIn)
  }

  function onMerchantLoggedIn(error) {
    merchantId = Meteor.userId()
    test.isTrue(typeof merchantId === "string")
    testFor(roles)
  }

  function testFor() {
    testLogout(test, onMerchantLoggedOut)
  }

  function onMerchantLoggedOut(error) {
    testLogin(roles, test, onRepLoggedIn)
  }

  function onRepLoggedIn(error) {
    expectedStorefront = {
      name: "some Storefront",
      description: "woot there it is",
      isPublished: true,
    }

    Mart.Storefronts.insert(_.clone(expectedStorefront), onStorefrontInserted)
  }

  function onStorefrontInserted(error, storeId) {
    storefrontId = storeId
    test.isUndefined(error, "Could not create test storefront")
    test.isTrue(typeof storefrontId === "string")

    Meteor.subscribe("mart/storefront", storefrontId, onStorefrontSubscribed)
  }

  let changedStorefront = {
    name: "sasdfasdf",
    description: "asdfasdfsadf",
    isPublished: false,
    repId: "repId",
    userId: "op"
  }

  function onStorefrontSubscribed() {
    let storefront = Mart.Storefronts.findOne(storefrontId)

    test.equal(storefront.repId, undefined)
    test.equal(storefront.userId, Meteor.userId())

    Mart.Storefronts.update(storefrontId, {$set: changedStorefront}, onStorefrontUpdated)
  }

  function onStorefrontUpdated(error, response) {
    test.isUndefined(error)

    let storefront = Mart.Storefronts.findOne(storefrontId)
    test.equal(storefront.name, "sasdfasdf")
    test.equal(storefront.description, "asdfasdfsadf")
    test.equal(storefront.repId, undefined)
    test.equal(storefront.userId, Meteor.userId())

    Mart.Storefronts.remove(storefrontId, onStorefrontRemoved)
  }

  function onStorefrontRemoved(error, response) {
    test.isNotUndefined(error)

    done()
  }
})
