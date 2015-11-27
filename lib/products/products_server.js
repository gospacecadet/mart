Security.defineMethod("ifStorefrontBelongsToCurrentUser", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    var storefront = Mart.Storefronts.findOne({_id: doc.storefrontId, isActive: true, isDeleted: false})
    if(storefront) {
      return userId !== storefront.userId
    }
    return true;
  }
});

Mart.Products.permit(['insert', 'update', 'remove']).never().apply();
Mart.Products.permit(['insert', 'update'])
  .ifStorefrontBelongsToCurrentUser()
  .apply();

Meteor.publish("mart/products", function(storefrontId) {
  return Mart.Products.find({
    isActive: true,
    isDeleted: false,
    storefrontId: storefrontId
  });
});
