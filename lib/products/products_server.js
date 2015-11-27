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
