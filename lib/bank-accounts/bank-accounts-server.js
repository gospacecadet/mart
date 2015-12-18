Meteor.publish("mart/bank-accounts", function() {
  return Mart.BankAccounts.find({userId: this.userId})
});
