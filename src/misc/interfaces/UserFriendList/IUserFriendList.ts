import IUser from 'src/misc/interfaces/User/IUser'
import IUserFriendListModerator from 'src/misc/interfaces/UserFriendList/IUserFriendListModerator'
import IUserFriendListMember from 'src/misc/interfaces/UserFriendList/IUserFriendListMember'
import IUserFriendListVehicle from 'src/misc/interfaces/UserFriendList/IUserFriendListVehicle'
import IUserFriendListInvite from 'src/misc/interfaces/UserFriendList/IUserFriendListInvite'

export default interface IUserFriendList {
  /**
   * The id of the friend list
   */
  id: number
  /**
   * The id of the user that the friend list belongs to
   */
  user_id: number
  /**
   * the user that the friend list belongs to
   */
  user?: IUser
  /**
   * The name of the friend list
   */
  name: string
  /**
   * list of all moderators of the friend list
   */
  moderators?: IUserFriendListModerator[]
  /**
   * list of all members of the friend list
   */
  members?: IUserFriendListMember[]
  /**
   * if vehicle sharing is enabled for the friend list all vehicles that have been shared are in there
   */
  vehicles?: IUserFriendListVehicle[]
  /**
   * list of all invites
   */
  invites?: IUserFriendListInvite[]
  /**
   * if vehicle sharing is enabled
   */
  vehicles_enabled: boolean
  created_at: string
  updated_at: string
}
