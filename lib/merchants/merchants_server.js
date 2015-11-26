Meteor.publish("mart/merchants", function() {
  return Mart.Merchants.find({
    isActive: true,
    isDeleted: false
  });
});

Mart.Merchants.permit(['insert', 'update']).ifLoggedIn().apply()
