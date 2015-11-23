// Write your tests here!
// Here is an example.
Tinytest.add('Contract - create contract with unique name', function (test) {
    var t = new Date().getTime() // 
    Mart.createContract("testContract" + t, null)
    var shouldPass = false

    try {
      Mart.createContract("testContract" + t, null)
    } catch(error) {
      shouldPass = true;
    }
    test.isTrue(shouldPass)
});
