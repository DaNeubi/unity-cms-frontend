import IUser from 'src/misc/interfaces/User/IUser'
import INewsboard from 'src/misc/interfaces/Newsboard/INewsboard'

export default interface IUserNewsBoardRead {
  id: number
  /**
   * id of the user
   */
  user_id: number
  /**
   * the user
   */
  user?: IUser | null
  /**
   * id of the news board
   */
  news_board_id: number
  /**
   * the news board
   */
  newsBoard?: INewsboard | null
  /**
   * version of the user read
   */
  version: number
  created_at: string
  updated_at: string
}
