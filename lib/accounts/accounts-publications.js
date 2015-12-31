Meteor.publish("mart/user", function(userId) {
  if(userId === this.userId) {
    return Meteor.users.find(userId, { fields: {
      emails: 1,
      profile: 1,
      roles: 1
    }})
  }
});
