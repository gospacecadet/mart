// Write your tests here!
// Here is an example.
Tinytest.add('Contract - create contract with unique name', function (test) {
    Mart.createContract("testContract", null)
    var shouldPass = false

    try {
      Mart.createContract("testContract", null)
    } catch(error) {
      shouldPass = true;
    }
    test.isTrue(shouldPass)
});
