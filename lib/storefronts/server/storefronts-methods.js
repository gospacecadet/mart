Meteor.methods({
  'mart/storefront/publish': function(storefrontId) {
    // console.log('mart/storefront/publish');
    check(storefrontId, String)

    // make sure user has edit permission
    // var operationAllowed = Security.can(this.userId)
    //   .update(storefrontId, {$set: {isPublished: true}}).
    //   for(Mart.Storefronts).check()
    var storefront = Mart.Storefronts.findOne({
      _id: storefrontId, userId: this.userId
    })
    if(!storefront) {
      throw new Meteor.Error(Mart.Errors.UNAUTHORIZED, "You are not allowed to do that.")
    }

    // if store has at least one published product
    let publishedProduct = Mart.Products.findOne({
      storefrontId: storefrontId,
      isPublished: true,
      isDeleted: false
    })

    if(!!publishedProduct) {
      Mart.Storefronts.update(storefrontId,
        {$set: {isPublished: true}},
        {getAutoValues: false})
    } else {
      throw new Meteor.Error(Mart.Errors.CANNOT_PUBLISH, "There must be at least one published product first.")
    }
  },
  'mart/storefront/unpublish': function(storefrontId) {
    check(storefrontId, String)

    var storefront = Mart.Storefronts.findOne({
      _id: storefrontId, userId: this.userId
    })
    if(!storefront) {
      throw new Meteor.Error(Mart.Errors.UNAUTHORIZED, "You are not allowed to do that.")
    }

    return Mart.Storefronts.update(storefrontId,
      {$set: {isPublished: false}},
      {getAutoValues: false})
  }
});

touchStorefrontUpdatedAt = function(storefrontId) {
  var storefront = Mart.Storefronts.findOne(storefrontId)
  if(storefront) {
    Mart.Storefronts.update(storefrontId, {$set: {updatedAt: new Date()}})
  }
}

updateLowestStorefrontPrice = function(storefrontId) {
  var storefront = Mart.Storefronts.findOne(storefrontId)
  var lowestStorefrontPriceInCents
  var lowestStorefrontPriceUnit

  var products = Mart.Products.find({storefrontId: product.storefontId})
  var lowestProductPriceInCents
  var lowestProductPriceUnit

  _.each(products.fetch(), product => {
    var prices = Mart.Prices.find({productId: product._id})

    _.each(prices.fetch(), price => {
      if(!lowestProductPriceInCents || (price.priceInCents < lowestProductPriceInCents)) {
        lowestProductPriceUnit = price.unit
        lowestProductPriceInCents = price.priceInCents
      }

      if(!lowestStorefrontPriceInCents || (price.priceInCents < lowestStorefrontPriceInCents)) {
        if(product.isPublished) {
          lowestStorefrontPriceInCents = price.priceInCents
          lowestStorefrontPriceUnit = price.unit
        }
      }
    })

    Mart.Products.update(product._id, {$set: {
      lowestPriceCents: lowestProductPriceInCents,
      lowestPriceUnit: lowestProductPriceUnit
    }})
  })

  Mart.Storefronts.update(storefront._id, {$set: {
    lowestPriceCents: lowestStorefrontPriceInCents,
    lowestPriceUnit: lowestStorefrontPriceUnit
  }})
}
