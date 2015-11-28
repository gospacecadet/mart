if(Meteor.isServer){
  Tinytest.add('Gateway - create gateway with unique name', function (test) {
    var t = new Date().getTime()
    Mart.createGateway("testGateway" + t, Mart.GatewayTypes.Test)
    var shouldPass = false

    try {
      Mart.createGateway("testGateway" + t, Mart.GatewayTypes.Test)
    } catch(error) {
      shouldPass = true;
    }
    test.isTrue(shouldPass, "Expected an error on second creation attempt")
  });
}
