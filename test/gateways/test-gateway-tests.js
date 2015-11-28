if(Meteor.isServer){
  testAsyncMulti('gateway/test - get-account-info', [
    function(test, expect) {
      var name = 'testContract' + new Date().getTime()
      Mart.Gateway.createContract(name, Mart.Gateway.Test)

      test.
    }
  ])
}
