Mart.Prices.after.insert(function (userId, doc) {
  var product = Mart.Products.findOne(doc.productId)
  if(product) {
    var newCents = doc.priceInCents
    var newUnit = doc.unit
    var lowestPrice = product.lowestPriceCents

    if(!lowestPrice || (lowestPrice > newCents)) {
      Mart.Products.update(product._id, {$set: {
        lowestPriceCents: newCents,
        lowestPriceUnit: newUnit
      }})
    }

    var storefront = Mart.Storefronts.findOne(product.storefrontId)
    if(storefront) {
      lowestPrice = storefront.lowestPriceCents
      if(!lowestPrice || (lowestPrice > newCents)) {
        Mart.Storefronts.update(storefront._id, {$set: {
          lowestPriceCents: newCents,
          lowestPriceUnit: newUnit
        }})
      }
    }
  }
});
Meteor.publish("mart/prices", function(productId) {
  check(productId, String);

  var cursor = Mart.Prices.find({productId: productId})
  var product = Mart.Products.findOne(productId)
  if(!product)
    return

  var storefront = Mart.Storefronts.findOne({
    _id: product.storefrontId,
    isDeleted: false
  })
  if(!storefront)
    return

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


});
