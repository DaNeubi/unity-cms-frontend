import IContract from 'src/misc/interfaces/Contract/IContract'

export default interface IContractSetting {
  /**
   * Contract setting ID
   */
  id: number
  /**
   * id of the contract
   */
  contract_id: number
  /**
   * contract
   */
  contract?: IContract
  /**
   * uf the user share will be applied
   */
  user_share: boolean
  /**
   * if items are addable while booking
   */
  items_addable: boolean
}
