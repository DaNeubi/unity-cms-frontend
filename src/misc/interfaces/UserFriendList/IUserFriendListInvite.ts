import IUserFriendList from 'src/misc/interfaces/UserFriendList/IUserFriendList'
import IUser from 'src/misc/interfaces/User/IUser'

export default interface IUserFriendListInvite {
  /**
   * id of the
   */
  id: number
  /**
   * id of the friend list this invite belongs to
   */
  user_friend_list_id: number
  /**
   * the friend list this invite belongs to
   */
  friend_list?: IUserFriendList
  /**
   * the id of the user that the invite is for
   */
  user_id: number
  /**
   * the user that the invite is for
   */
  user?: IUser
  /**
   * the id of the user that invited the user
   */
  invited_by_id: number
  /**
   * the user that invited the user
   */
  invited_by?: IUser
  /**
   * the status of the invite
   */
  status: number
  /**
   * the type of the invite
   */
  type: number
  created_at: string
  updated_at: string
}
