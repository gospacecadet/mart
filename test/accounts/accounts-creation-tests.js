// role shopper if none defined
var shopper = {
  email: Random.id() + "@" + Random.id() + ".com",
  password: 'swefsadfasdfsad',
}

Tinytest.addAsync('Accounts - Creation - Shopper by default', function(test, done) {
  testLogout(test, createUser)
  function createUser() {
    Mart.Accounts.createUser(shopper, function(error) {
      test.isUndefined(error)
      test.equal(Meteor.user().roles,  {"mart-roles-groups-global":["mart-roles-golbal-shopper"]})
      done()
    })
  }
})
