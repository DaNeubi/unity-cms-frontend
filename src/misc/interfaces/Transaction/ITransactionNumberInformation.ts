export default interface ITransactionNumberInformation {
  /**
   * id of the user
   */
  userId: number
  /**
   * id of the company
   */
  companyId: number
  /**
   * new transaction number
   */
  transactionNumber: number
  /**
   * if the user requested a new number
   */
  requestedNewNumber: boolean
}
