Mart.createBankAccount = function(gatewayTypeName, bankAccount, callback) {
  Mart.GatewayTypes[gatewayTypeName].createBankAccount(bankAccount, callback)
}
_.extend(Mart.BankAccounts, {
  RECIPIENT_TYPES: ["corporation", "individual"],
})

Mart.BankAccountSchema = new SimpleSchema({
  name: {
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
    allowedValues: Mart.BankAccounts.RECIPIENT_TYPES
  },
  taxId: {
    type: String,
    label: "Tax ID or SSN",
  },
})
