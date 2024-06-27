import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface IIntermediateTransactionHistoryUpdate extends IBaseObject {
  /**
   * if of the company this changed event is for
   */
  company_id: number
  /**
   * ids of the transaction history items that were updated
   */
  transactionHistoryItemIds: number[]
}
