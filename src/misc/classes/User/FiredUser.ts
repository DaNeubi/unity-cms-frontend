import User from 'src/misc/classes/User/User'

export default class FiredUser {
  /**
   * the date the user was fired
   */
  created_at: Date = new Date()
  /**
   * id of the record
   */
  id = 0
  /**
   * the reason the user was fired
   */
  reason = ''
  /**
   * The user that fired the user this is about
   */
  fired_by_user: User | undefined = undefined
  /**
   * The user that was fired
   */
  fired_user: User | undefined = undefined
}
