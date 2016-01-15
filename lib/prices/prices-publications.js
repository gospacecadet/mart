Meteor.publish("mart/prices", function(productId) {
  console.log(productId);
  check(productId, String);

  var cursor = Mart.Prices.find({productId: productId})
  var product = Mart.Products.findOne(productId)
  var storefront = Mart.Storefronts.findOne({
    _id: product.storefrontId,
    isDeleted: false
  })

  if(storefront) {
    if(Mart._isAdmin(this.userId)) {
      return cursor

    } else if(Mart._isRep(this.userId)) {
      if(this.userId === storefront.repId)
        return cursor

    } else if(Mart._isMerchant(this.userId)) {
      if(this.userId === storefront.userId)
        return cursor
    }

    var storefront = Mart.Storefronts.findOne({
      _id: product.storefrontId,
      isDeleted: false,
      isPublished: true
    })

    if(storefront) {
      return cursor
    }
  }

});
