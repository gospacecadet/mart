Mart.Gateways = new Mongo.Collection("MartGatewayContracts");
Mart.GatewayTypes = {}
Mart._gateways = {}

Mart.getGateway = function(gatewayName) {
  return this._gateways[gatewayName];
}

Mart.Gateway = function(gatewayName, gatewayType, options) {
  check(this, Mart.Gateway)

  // general gateway requirements
  check(gatewayType, {
    currency: String,
    gatewayType: String,
    requiredFieldsMatch: Object,
    optionalFieldsMatch: Object,
    requiredFields: Object,
    retrieveAccountInfo: Function
  })

  // fields specifically for gateway type
  var defaultGateway = gatewayType.requiredFields
  check(gatewayName, String)
  defaultGateway["name"] = gatewayName

  // not sure if this check is necessary
  // can fields for gateway ever change from hardcoded values?
  check(defaultGateway, gatewayType.requiredFieldsMatch)
  // fields for options
  check(options, gatewayType.optionalFieldsMatch)

  var gateway = _.defaults(options, defaultGateway)

  this.getGateway = function () {
    return gateway;
  };

  this._gateway = gateway
}

var checkContractName = function(contractName) {
  check(contractName, String);

  var contract = Mart.getContract(contractName);
  if(!contract)
    throw new Error('invalid-contract-name', "You did not supply a valid contract name")

  return contract;
}

Meteor.methods({
  'mart/update-gateway-info': function (contractName) {
    var contract = checkContractName(contractName)
    return contract.retrieveAccountInfo();
  },
  'mart/charge-card': function (contractName, cardId, cartId) {
    var contract = checkContractName(contractName)
    return contract.chargeCard(cardId, cartId);
  },
});
