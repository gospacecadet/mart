Meteor.publish("mart/subscriptions", function() {
  return Mart.Subscriptions.find({$or: [
    {userId: this.userId},
    {merchantId: this.userId}
  ]})
});
