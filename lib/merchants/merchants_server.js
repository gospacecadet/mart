Meteor.publish("mart/merchants", function() {
  return Mart.Merchants.find({
    isActive: true,
    isDeleted: false
  });
});

Meteor.publish("mart/merchant", function(merchantId) {
  check(merchantId, String)
  return Mart.Merchants.find(merchantId);
});

Mart.Merchants.permit(['insert', 'update']).ifLoggedIn().apply()
