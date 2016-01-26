Meteor.publish("mart/products", function(storefrontId) {
  check(storefontId, String);

  var selector = {
    isDeleted: false,
    storefrontId: storefrontId
  }

  var storefront = Mart.Storefronts.findOne(storefrontId)
  if(!storefront || (storefront.userId !== this.userId)) {
    _.extend(selector, {isPublished: true})
  }

  return Mart.Products.find(selector,
    {fields: {
      _id: 1,
      name: 1,
      description: 1,
      occupancy: 1,
      size: 1,
      storefrontId: 1,
    }});


});

Meteor.publish("mart/product", function(productId) {
  check(productId, String)
  var isNotMerchant = true

  var selector = {
    isDeleted: false,
    _id: productId
  }
  var product = Mart.Products.findOne(productId)

  if(product) {
    var storefront = Mart.Storefronts.findOne(product.storefrontId)
    if(storefront && (storefront.userId === this.userId))
      isNotMerchant = false
  }

  if(isNotMerchant) {
    _.extend(selector, {isPublished: true})
  }

  return [
    Mart.Products.find(selector,
      {fields: {
        _id: 1,
        name: 1,
        description: 1,
        occupancy: 1,
        size: 1,
      }}),

    Mart.Images.find({
      objectId: productId,
      objectCollection: "Products",
    }),

    Mart.Prices.find({
      productId: productId
    })
  ]
});
