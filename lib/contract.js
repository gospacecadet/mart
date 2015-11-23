Mart._contracts = {};

Mart.createContract = function(contractName, gateway) {
  if(_.has(Mart._contracts, contractName))
    throw new Error("Payment Contract '" + contractName + "' already exists");

  return (Mart._contracts[contractName] =
    new Mart.Contract(gateway))
}

Mart.Contract = function(gateway, contract) {
  check(this, Mart.Contract)
  var self = this

  // .extend(self, {
  //   getGateway: function() {
  //     return gateway
  //   },
  //   getAccountInfo: function(callback) {
  //     gateway.getAccountInfo(callback)
  //   }
  // })

  this._contract = contract
}
