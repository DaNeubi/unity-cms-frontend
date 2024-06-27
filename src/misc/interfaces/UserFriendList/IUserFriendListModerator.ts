import IUserFriendList from 'src/misc/interfaces/UserFriendList/IUserFriendList'
import IUser from 'src/misc/interfaces/User/IUser'

export default interface IUserFriendListModerator {
  /**
   * id of the moderator
   */
  id: number
  /**
   * id of the user_friend_list that the moderator is moderating
   */
  user_friend_list_id: number
  /**
   * the user_friend_list that the moderator is moderating
   */
  user_friend_list?: IUserFriendList
  /**
   * id of the user that is a moderator
   */
  user_id: number
  /**
   * the user that is a moderator
   */
  user?: IUser
  created_at: string
  updated_at: string
}
