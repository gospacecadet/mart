Mart.Storefronts = new Mongo.Collection("MartStorefronts",{
  transform: function(doc) {return new Storefront(doc)}
});

var Storefront = function(doc) {
  _.extend(this, doc)
}

_.extend(Storefront.prototype, {
  products: function() {
    return Mart.Products.find({storefrontId: this._id},
      {sort: {updatedAt: -1}})
  },
})

Mart.Storefronts.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: "Name",
    max: 50
  },
  description: {
    type: String,
    label: "Description",
    max: 1000
  },
  isPublished: {
    type: Boolean,
    label: "Ready to be published?",
    autoValue: function() {
      // Should only be able to publish from server if several conditions are met
      this.unset()
      if(this.isInsert) {
        return false
      }
    }
  },
  isDeleted: {
    type: Boolean,
    autoValue: function() {
      // Should only be able to publish from server if several conditions are met
      this.unset()
      if(this.isInsert) {
        return false
      }
    }
  },
  userId: {
    type: String,
    // Reps and Admins can create Storefronts on behalf of Merchants
    // Don't allow reassignment for security
    autoValue: function() {
      if(this.isInsert) {
        if(Roles.userIsInRole(
          this.userId,
          [Mart.ROLES.GLOBAL.REP, Mart.ROLES.GLOBAL.ADMIN],
          Mart.ROLES.GROUPS.GLOBAL)) {
            return
        } else if(Mart._isMerchant(this.userId)) {
          return this.userId
        }
      }
      this.unset()
    },
    denyUpdate: true
  },
  repId: {
    type: String,
    optional: true,
    autoValue: function() {
      if(this.isInsert && Roles.userIsInRole(
        this.userId,
        [Mart.ROLES.GLOBAL.REP],
        Mart.ROLES.GROUPS.GLOBAL)) {
          return this.userId
      } else if(Roles.userIsInRole(
        this.userId,
        [Mart.ROLES.GLOBAL.ADMIN],
        Mart.ROLES.GROUPS.GLOBAL)) {
          return this.value || this.userId
      }

      this.unset()
    },
  },
  address: {
    type: String
  },
  address2: {
    type: String,
    optional: true
  },
  city: {
    type: String,
  },
  state: {
    type: String
  },
  zip: {
    type: String
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if(this.isInsert) {
        return new Date()
      }

      this.unset()
    },
  },
  lowestPriceCents: {
    type: Number,
    optional: true
  },
  lowestPriceUnit: {
    type: String,
    allowedValues: Mart.Product._UNITS(),
    optional: true
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      this.unset()
      return new Date()
    },
    optional: true
  },
  referer: {
    type: String,
    optional: true
  }
}))
