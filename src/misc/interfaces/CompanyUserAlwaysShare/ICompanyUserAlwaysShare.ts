import IBaseObject from 'src/misc/interfaces/IBaseObject'
import Rank from 'src/misc/classes/Rank/Rank'

export interface ICompanyUserAlwaysShare extends IBaseObject {
  /**
   * id of the user always share
   */
  id: number
  /**
   * id of the rank
   */
  rank_id: number
  /**
   * the rank that is associated
   */
  rank: Rank | undefined
  /**
   * amount of the user always share
   */
  always_share: number
  /**
   * if the user always share is enabled in the cash register
   */
  always_share_cash_register: boolean
  /**
   * the company id
   */
  company_id: number
  /**
   * when the user always share was created
   */
  created_at: string
  /**
   * when the user always share was updated
   */
  updated_at: string
}
