Security.defineMethod("ownsObject", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc, fields, modifier) {
    if(!!userId) {
      var collection = doc.objectCollection
      var objectId = doc.objectId
      if(Roles.userIsInRole(
        userId,
        [Mart.ROLES.GLOBAL.MERCHANT],
        Mart.ROLES.GROUPS.GLOBAL)) {

          if(collection === "Storefronts") {
            var storefront = Mart.Storefronts.findOne({
              _id: objectId,
              userId: userId
            })

            return !storefront
          } else if(collection === "Products") {
            var product = Mart.Products.findOne(objectId)

            if(!!product) {
              var storefront = Mart.Storefronts.findOne({
                _id: product.storefrontId,
                userId: userId
              })

              return !storefront
            }

          }
        }
    }

    return true
  }
});

Mart.Images.permit(['insert', 'update'])
  .ownsObject()
  .apply()
