Meteor.publish("mart/products", function(storefrontId) {
  return Mart.Products.find({
    isActive: true,
    isDeleted: false,
    storefrontId: storefrontId
  },
  {fields: {
    name: 1,
    description: 1,
    unitPrice: 1,
  }});
});

Meteor.publish("mart/product", function(productId) {
  check(productId, String)

  return Mart.Products.find({
    isPublished: true,
    isDeleted: false,
    _id: productId
  },
  {fields: {
    name: 1,
    description: 1,
    unitPrice: 1
  }})
});
