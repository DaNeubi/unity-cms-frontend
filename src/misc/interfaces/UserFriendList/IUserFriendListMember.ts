import IUserFriendList from 'src/misc/interfaces/UserFriendList/IUserFriendList'
import IUser from 'src/misc/interfaces/User/IUser'

export default interface IUserFriendListMember {
  /**
   * id of the member
   */
  id: number
  /**
   * id of the user_friend_list that the user is a member of
   */
  user_friend_list_id: number
  /**
   * the user_friend_list that the moderator is member
   */
  user_friend_list?: IUserFriendList
  /**
   * id of the user that is a member
   */
  user_id: number
  /**
   * the user that is a member
   */
  user?: IUser
  created_at: string
  updated_at: string
}
