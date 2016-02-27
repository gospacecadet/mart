Meteor.publish("mart/deposits", function() {
  return Mart.Deposits.find({$or: [
    {shopperId: this.userId},
    {merchantId: this.userId}
  ]})
});

Meteor.publish("mart/deposits-pending", function() {
  if(Mart._isAdmin(this.userId)) {
    return Mart.Deposits.find({state: Deposit.STATES.PENDING})
  }

  this.ready()
});
