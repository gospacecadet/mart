Mart.AccountInfo = function(contractName) {
  var self = this

  _.extend(self, {
    retrieve: function(callback) {
      Meteor.call('mart/retrieve-account-info', contractName, function(err, resp) {
        return callback(err, resp)
      });

      return self
    }
  })
}
