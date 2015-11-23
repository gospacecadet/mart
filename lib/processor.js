Mart.Processor = function(contractName) {
  var self = this,
      contract = Mart.getContract(contractName)

  _.extend(self, {
    getAccountInfo: function(callback) {
      self.contract.getAccountInfo(callback)
    }
  })
}
