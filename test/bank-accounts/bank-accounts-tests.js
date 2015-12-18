// can create a bank account from the client
var bankAccount = {
  accountNumber: "000123456789",
  routingNumber: "110000000",
  recipientType: 'corporation',
  taxId: "000000000",
  name: "Test Bank Account asf;ddsaf"
}

if(Meteor.isClient) {
  Tinytest.addAsync('Bank Accounts - Stripe - add', function(test, done) {
    var bankAccountId, baSub

    testLogout(test, function() {
      testLogin([Mart.ROLES.GLOBAL.MERCHANT], test, createBankAccount)
    })

    function createBankAccount() {
      Mart.createBankAccount('Stripe', bankAccount, function(err, bId) {
        test.isUndefined(err, 'Unexpected ERROR CREATING BANK ACCOUNT');
        bankAccountId = bId
        baSub = Meteor.subscribe("mart/bank-accounts", verifyBankDetails);
      })
    }

    function verifyBankDetails() {
      var bankAccount = Mart.BankAccounts.findOne(bankAccountId)

      test.isNotUndefined(bankAccount)
      test.isUndefined(bankAccount.taxId)
      test.isUndefined(bankAccount.accountNumber)
      test.equal(bankAccount.userId, Meteor.userId())
      test.equal(bankAccount.last4, "6789")
      test.equal(bankAccount.routingNumber, "110000000")
      test.equal(bankAccount.name, "Test Bank Account asf;ddsaf")
      test.equal(bankAccount.bankName, "STRIPE TEST BANK")
      test.equal(bankAccount.country, "US")
      test.equal(bankAccount.currency, "usd")

      baSub.stop()
      done()
    }
  })
}
