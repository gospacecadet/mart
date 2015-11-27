Meteor.publish("mart/storefronts", function() {
  return Mart.Storefronts.find({
    isActive: true,
    isDeleted: false
  });
});

Meteor.publish("mart/storefront", function(storefrontId) {
  check(storefrontId, String)
  return Mart.Storefronts.find(storefrontId);
});

Mart.Storefronts.permit(['insert', 'update']).ifLoggedIn().apply()
