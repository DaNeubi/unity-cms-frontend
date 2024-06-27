import IBaseObject from '../IBaseObject'
import Rank from 'src/misc/classes/Rank/Rank'

export interface ICompanyUserShare extends IBaseObject {
  /**
   * id of the user share
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
   * id of the company
   */
  company_id: number
  /**
   * user share amount percentage
   */
  user_share: number
  /**
   * when the user share was created
   */
  created_at: string
  /**
   * when the user share was updated
   */
  updated_at: string
}
