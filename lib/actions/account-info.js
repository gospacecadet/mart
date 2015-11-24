Mart.AccountInfo = function(contractName) {
  var self = this

  _.extend(self, {
    retrieve: function(callback) {
      Meteor.call('mart/retrieve-account-info', contractName, callback)

      return self
    }
  })
}
