Mart.Prices.hookOptions.after.update = {fetchPrevious: false};

Mart.Prices.after.insert(function (userId, doc) {
  removeOldPrices(doc)
  updateLowestProductPrice(doc)
  touchProductUpdatedAt(doc.productId)
});

Mart.Prices.after.update(function (userId, doc, fieldNames, modifier, options) {
  updateLowestPrice(doc)
  touchProductUpdatedAt(doc.productId)
});

var removeOldPrices = function(doc) {
  var oldPrices = Mart.Prices.find({productId: doc.productId, unit: doc.unit})

  if(oldPrices.count() > 1) {
    _.each(oldPrices.fetch(), oldPrice => {
      if(oldPrice._id !== doc._id)
        Mart.Prices.remove(oldPrice._id)
    })
  }

}

updateLowestProductPrice = function(productId) {
  var product = Mart.Products.findOne(productId)
  if(product) {
    updateLowestStorefrontPrice(product.storefrontId)
  }
}

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
