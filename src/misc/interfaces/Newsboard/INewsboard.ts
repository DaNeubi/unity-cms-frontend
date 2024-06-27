import INewsboardRank from './INewsboardRank'
import IUserNewsBoardRead from 'src/misc/interfaces/User/IUserNewsBoardRead'

export interface INewsboard {
  /**
   * id of the newsboard
   */
  id: number
  /**
   * name of the newsboard
   */
  name: string
  /**
   * content of the newsboard
   */
  content: string
  /**
   * order number of the newsboard
   */
  order_number: number
  /**
   * version of the newsboard
   */
  version: number
  /**
   * date of creation of the newsboard
   */
  created_at: string
  /**
   * when the newsboard has been updated the last time
   */
  updated_at: string
  /**
   * all the ranks that have access to the newsboard
   * if none, all ranks have access
   */
  rank_boards: INewsboardRank[]
  /**
   * all the users that have read the newsBoard
   */
  user_reads: IUserNewsBoardRead[] | null
}

export default INewsboard
