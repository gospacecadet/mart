Mart._contracts = {}
Mart.Contracts = new Mongo.Collection("Contracts");

Mart.getContract = function (contractName) {
  // console.log("Full of " + this._contracts[contractName])
  return this._contracts[contractName];
};

Mart.createContract = function(contractName, gateway, options={}) {
  if(_.has(Mart._contracts, contractName))
    throw new Error("Payment Contract '" + contractName + "' already exists");

  Mart.Contracts.upsert({name: contractName},
    {$set: {
      name: contractName, type: "Stripe"
    }})
  return (Mart._contracts[contractName] =
    new Mart.Contract(gateway, options))
}

// for the moment, a contract is just a named gateway
Mart.Contract = function(gateway, options) {
  check(this, Mart.Contract)

  // general gateway requirements
  check(gateway, {
    currency: String,
    requiredFieldsMatch: Object,
    optionalFieldsMatch: Object,
    requiredFields: Object,
    retrieveAccountInfo: Function
  })

  // fields specifically for gateway type
  var defaultContract = gateway.requiredFields
  // not sure if this check is necessary
  // can fields for gateway ever change from hardcoded values?
  check(defaultContract, gateway.requiredFieldsMatch)
  // fields for options
  check(options, gateway.optionalFieldsMatch)

  var contract = _.defaults(options, defaultContract)

  this.getGateway = function () {
    return gateway;
  };

  this._contract = contract
}

_.extend(Mart.Contract.prototype, {
  retrieveAccountInfo: function() {
    return this.getGateway().retrieveAccountInfo(this._contract)
  }
})

if(Meteor.isServer) {
  Meteor.methods({
    'mart/retrieve-account-info': function (contract) {
      check(contract, {
        name: String,
        secretKey: String
      });

      var contract = Mart.getContract(contract.name);
      if(!contract)
        throw new Error('invalid-contract-name', "You did not supply a valid contract name")

      return contract.retrieveAccountInfo();
    }
  });
}
