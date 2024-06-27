import IContract from 'src/misc/interfaces/Contract/IContract'
import IUser from 'src/misc/interfaces/User/IUser'
import IContractOnHoldTransactionItem from 'src/misc/interfaces/Contract/IContractOnHoldTransactionItem'

export default interface IContractOnHoldTransaction {
  /**
   * id of the contract on hold transaction
   */
  id: number
  /**
   * amount of discount for the transaction
   */
  discount_amount: number
  /**
   * total of the transaction
   */
  total: number
  /**
   * amount of user share for the transaction
   */
  user_share_amount: number
  /**
   * note for the transaction
   */
  note: string|null
  /**
   * id of the transaction
   */
  contract_id: number
  /**
   * contract of the transaction
   */
  contract?: IContract
  /**
   * id of the user that made the transaction
   */
  user_id: number
  /**
   * user that made the transaction
   */
  user?: IUser
  contract_on_hold_transaction_items?: IContractOnHoldTransactionItem[]
  created_at?: string
  updated_at?: string
}
