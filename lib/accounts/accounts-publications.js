Meteor.publish("mart/user", function(userId) {
  check(userId, String);

  if(userId === this.userId) {
    return Meteor.users.find(userId, {fields: {
      emails: 1,
      profile: 1,
      roles: 1
    }})
  }
});

Meteor.publish("mart/profile", function(userId){
  check(userId, String);
  return Meteor.users.find(userId, {fields: {
    profile: 1,
  }})
});
