sendWelcomeEmail = function(userId) {
  var user = Meteor.users.findOne(userId)
  var firstName = user.profile.firstName
  var email = user.emails[0].address

  Email.send({
    to: email,
    from: "SpaceCadet <hello@spacecadet.io>",
    subject: "Welcome to SpaceCadet",
    text: "Greetings "+ firstName + ",\n\n" +
    "Thank you for joining the SpaceCadet Fleet, and we appreciate your support as we work to activate space and communities.  Whether you are listing or renting space, we appreciate your feedback and please feel free to share your story with us!\n\n" +
    "Please let us know if you have any questions, and check out our Podcast <https://spacecadet.io/sa-launch-pod> to hear what it's like inside a Tech Startup.\n\n" +
    "Happy Renting,\n" +
    "The Space Cadets\nspacecadet.io\n@gospacecadet"
  });
}
