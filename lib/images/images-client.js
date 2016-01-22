Mart.Image = {
  // Return the nth image
  n: function(n, objectId, objectCollection) {
    return Mart.Images.findOne({objectId: objectId, objectCollection: objectCollection}, {skip: n-1})
  },
  nS: function(n, objectId) {
    return this.n(n, objectId, "Storefronts")
  },
  nP: function(n, objectId) {
    return this.n(n, objectId, "Products")
  },
  ImageQuality: Meteor.settings.public.IMAGE_QUALITY || 1
}
