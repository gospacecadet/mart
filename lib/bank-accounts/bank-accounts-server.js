Meteor.publish("mart/bank-accounts", function() {
  return Mart.BankAccounts.find({userId: this.userId})
});

Meteor.publish("mart/bank-accounts-for", function(merchantId) {
  if(Mart._isAdmin(this.userId))
    return Mart.BankAccounts.find({userId: merchantId})
});
