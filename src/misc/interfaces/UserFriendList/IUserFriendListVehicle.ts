import IUserFriendList from 'src/misc/interfaces/UserFriendList/IUserFriendList'
import IUserVehicle from 'src/misc/interfaces/UserVehicle/IUserVehicle'

export default interface IUserFriendListVehicle {
  /**
   * id of the user friend list vehicle
   */
  id: number
  /**
   * id of the user friend list
   */
  user_friend_list_id: number
  /**
   * user friend list
   */
  user_friend_list?: IUserFriendList
  /**
   * id of the user vehicle
   */
  user_vehicle_id: number
  /**
   * user vehicle
   */
  vehicle?: IUserVehicle
  created_at: string
  updated_at: string
}
