Mart.Storefronts = new Mongo.Collection("MartStorefronts");
Mart.Storefronts.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: "Name",
    max: 50
  },
  description: {
    type: String,
    label: "Description",
    optional: true,
    max: 1000
  },
  isPublished: {
    type: Boolean,
    label: "Station published?"
  },
  isDeleted: {
    type: Boolean,
    defaultValue: false
  },
  userId: {
    type: String,
    // Reps and Admins can create Storefronts on behalf of Merchants
    autoValue: function() {
      if(this.isInsert) {
        if(Roles.userIsInRole(
          this.userId,
          [Mart.ROLES.GLOBAL.REP, Mart.ROLES.GLOBAL.ADMIN],
          Mart.ROLES.GROUPS.GLOBAL)) {
            return
        } else if(Roles.userIsInRole(
          this.userId,
          [Mart.ROLES.GLOBAL.MERCHANT],
          Mart.ROLES.GROUPS.GLOBAL)) {
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
  }
}))
