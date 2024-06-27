import IUser from 'src/misc/interfaces/User/IUser'

export default interface IUserSetting {
  /**
   * id of the user setting
   */
  id: number
  /**
   * if of the user this setting is for
   */
  user_id: number
  /**
   * user this setting is for
   */
  user?: IUser | null
  /**
   * if the user wants to save the last route on the tablet
   */
  last_route_save_tablet: number
  /**
   * if the user wants to save the last route on the web
   */
  last_route_save_web: number
  created_at?: string
  updated_at?: string
}
