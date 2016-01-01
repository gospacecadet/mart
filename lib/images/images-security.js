Security.defineMethod("ownsObject", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc, fields, modifier) {
    if(!!userId) {
      let collection = doc.objectCollection
      let objectId = doc.objectId
      if(Roles.userIsInRole(
        userId,
        [Mart.ROLES.GLOBAL.MERCHANT],
        Mart.ROLES.GROUPS.GLOBAL)) {

          if(collection === "Storefronts") {
            let storefront = Mart.Storefronts.findOne({
              _id: objectId,
              userId: userId
            })

            return !storefront
          }
        }
    }

    return true
  }
});

Mart.Images.permit(['insert', 'update'])
  .ownsObject()
  .apply()
