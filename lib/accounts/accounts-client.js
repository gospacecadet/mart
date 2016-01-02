Meteor.startup(function(){
  if(!!Meteor.userId()) {
    Meteor.subscribe("mart/user", Meteor.userId());
  }
});

Handlebars.registerHelper("loggedIn", function() {
  return !!Meteor.userId()
});

Handlebars.registerHelper("username", function() {
  if(!!Meteor.user()) {
    return Meteor.user().emails[0].address + " " + currentRoles()
  } else {
    return "Not logged in"
  }
});

var currentRoles = function() {
  var allRoles = Mart.ROLES.GLOBAL

  if(!!Meteor.user() && Meteor.user().roles) {
    var userRoles = Meteor.user().roles[Mart.ROLES.GROUPS.GLOBAL]
    var role = _.find(_.invert(allRoles), function(friendlyName, name) {
      return _.contains(userRoles, name)
    })

    return "(" + role + ")"
  }

  return "[Loading...]"
}

Mart.guestId = function() {
  if(!Meteor.userId()) {
    var gid = amplify.store(Mart.Cart.GUEST_ID)
    if(!gid) {
      gid = Random.id()
      amplify.store(Mart.Cart.GUEST_ID, gid)
    }

    return gid
  } else {
    Mart.resetGuestId()
    return null
  }
}

Mart.resetGuestId = function() {
  amplify.store(Mart.Cart.GUEST_ID, null)
}
