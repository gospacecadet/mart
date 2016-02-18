Security.defineMethod("ifStorefrontBelongsToCurrentUser", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    var storefront = Mart.Storefronts.findOne({
      _id: doc.storefrontId,
      isDeleted: false
    })

    if(!!storefront)
      return userId !== storefront.userId

    return true;
  }
});

Security.defineMethod("ifStorefrontManagedByCurrentUser", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    var storefront = Mart.Storefronts.findOne({
      _id: doc.storefrontId,
      isDeleted: false
    })

    if(!!storefront)
      return userId !== storefront.repId

    return true;
  }
});

Mart.Products.permit(['insert', 'update'])
  .ifRoles([
    Mart.ROLES.GLOBAL.MERCHANT,
  ])
  .ifStorefrontBelongsToCurrentUser()
  .apply();

Mart.Products.permit(['insert', 'update'])
  .ifRoles([
    Mart.ROLES.GLOBAL.ADMIN,
    Mart.ROLES.GLOBAL.REP
  ])
  .ifStorefrontManagedByCurrentUser()
  .apply();
