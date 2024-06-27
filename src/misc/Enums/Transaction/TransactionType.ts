enum TransactionType {
  /**
   * If the transaction is a purchase
   * Einkauf
   */
  Purchase = 1,
  /**
   * If the transaction is a sale
   * Verkauf
   */
  Sale = 2,
  /**
   * If the transaction is a userWithdraw
   * Mitarbeiterentnahme
   */
  UserWithdrawal = 3,
  /**
   * If the transaction if a metro purchase made with the users money
   * Metro Einkauf mit Bar Geld
   */
  MetroPurchaseMoney = 4,
  /**
   * If the transaction is a metro purchase made with the company card
   * Metro Einkauf mit Karte (vom Firmenkonto)
   */
  MetroPurchaseCard = 5,
  /**
   * If the transaction is a refuel
   * Tanken
   */
  Refuel = 6,
  /**
   * If the transaction is a custom purchase
   * Nicht gelistete Produkte Einkauf/Ausgabe
   */
  CustomPurchase = 7,
  /**
   * If the transaction is a custom sale
   * Nicht gelistete Produkte Verkauf/Einnahme
   */
  CustomSale = 8,
  /**
   * If the transaction is from a contract on Hold Transaction
   * Buchung einer ContractOnHoldTransaction
   */
  ContractSale = 9,
  /**
   * if a purchase is made from a sale
   * Buchung aus einem Verkauf
   */
  PurchaseFromSale = 10,
  /**
   * If the transaction is a tip
   * Trinkgeld
   */
  Tip = 11,
}

export default TransactionType
