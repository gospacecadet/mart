Meteor.publish("mart/images/product", function(productId) {
  check(productId, String);

  var product = Mart.Products.findOne({
    _id: productId,
    isPublished: true,
    isDeleted: false
  })

  if(product)
    return Mart.Images.find({objectId: productId, objectCollection: "Products"})
});

Meteor.publish("mart/images/storefront", function(storefrontId) {
  check(storefrontId, String);

  var storefront = Mart.Storefronts.findOne({
    _id: storefrontId,
    isPublished: true,
    isDeleted: false
  })

  if(storefront)
    return Mart.Images.find({objectId: storefrontId, objectCollection: "Storefronts"})
});
