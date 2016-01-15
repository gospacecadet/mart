Meteor.publish("mart/products", function(storefrontId) {
  return Mart.Products.find({
    isActive: true,
    isDeleted: false,
    storefrontId: storefrontId
  },
  {fields: {
    _id: 1,
    name: 1,
    description: 1,
    occupancy: 1,
    size: 1,
  }});
});

Meteor.publish("mart/product", function(productId) {
  check(productId, String)

  var product = Mart.Products.findOne(productId)

  return [
    Mart.Products.find({
      isPublished: true,
      isDeleted: false,
      _id: productId
      },
      {fields: {
        _id: 1,
        name: 1,
        description: 1,
        occupancy: 1,
        size: 1,
      }}),

    Mart.Storefronts.find({
        isPublished: true,
        isDeleted: false,
        _id: product.storefrontId
      },
      {fields: {
        _id: 1,
        name: 1,
        description: 1,
        address: 1,
        address2: 1,
        city: 1,
        state: 1,
        zip: 1
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
