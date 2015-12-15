Mart.createBankAccount = function(gatewayTypeName, bankAccount, options, callback) {
  Mart.GatewayTypes[gatewayTypeName].createCard(card, options, callback)
}

Mart.BankAccountSchema = new SimpleSchema({
  accountName: {
    type: String,
    label: "Account Name",
  },
  accountNumber: {
    type: String,
    label: "Account Number",
  },
  routingNumber: {
    type: String,
    label: "Routing Number",
  },
  recipientType: {
    type: String,
    label: "Recipient Type",
  },
  taxId: {
    type: String,
    label: "Tax ID or SSN",
  },
})
