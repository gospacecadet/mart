if(Meteor.isServer) {
  Tinytest.add('Contract - create contract with unique name', function (test) {
    var t = new Date().getTime() //
    Mart.createContract("testContract" + t, Mart.Stripe)
    var shouldPass = false

    try {
      Mart.createContract("testContract" + t, Mart.Stripe)
    } catch(error) {
      shouldPass = true;
    }
    test.isTrue(shouldPass, "Expected an error on second creation attempt")
  });
}
