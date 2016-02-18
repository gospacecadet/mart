Security.defineMethod("ifProductBelongsToCurrentUser", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    var product = Mart.Products.findOne({
      _id: doc.productId,
      isDeleted: false
    })

    if(!!product) {
      var storefront = Mart.Storefronts.findOne({
        _id: product.storefrontId,
        isDeleted: false
      })

      if(!!storefront)
        return userId !== storefront.userId
    }
    return true;
  }
});

Security.defineMethod("ifProductManagedByCurrentUser", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    var product = Mart.Products.findOne({
      _id: doc.productId,
      isDeleted: false
    })

    if(!!product) {
      var storefront = Mart.Storefronts.findOne({
        _id: product.storefrontId,
        isDeleted: false
      })

      if(!!storefront)
        return userId !== storefront.repId
    }

    return true;
  }
});

Security.defineMethod("ifOnlyUnitPrice", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    var price = Mart.Prices.findOne({
      unit: doc.unit,
      productId: doc.productId
    })

    return !!price
  }
});


Mart.Prices.permit(['insert'])
  .ifRoles([
    Mart.ROLES.GLOBAL.MERCHANT,
  ])
  .ifProductBelongsToCurrentUser()
  .ifOnlyUnitPrice()
  .apply();

Mart.Prices.permit(['insert'])
  .ifRoles([
    Mart.ROLES.GLOBAL.ADMIN,
    Mart.ROLES.GLOBAL.REP
  ])
  .ifProductManagedByCurrentUser()
  .ifOnlyUnitPrice()
  .apply();

Mart.Prices.permit(['update'])
  .ifRoles([
    Mart.ROLES.GLOBAL.MERCHANT,
  ])
  .ifProductBelongsToCurrentUser()
  .apply();

Mart.Prices.permit(['update'])
  .ifRoles([
    Mart.ROLES.GLOBAL.ADMIN,
    Mart.ROLES.GLOBAL.REP
  ])
  .ifProductManagedByCurrentUser()
  .apply();
