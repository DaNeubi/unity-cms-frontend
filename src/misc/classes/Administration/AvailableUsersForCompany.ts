/* eslint-disable camelcase */

export class AvailableUsersForCompany {
  /**
   * The email of the user
   */
  public email: string
  /**
   * The first name of the user
   */
  public first_name: string
  /**
   * The last name of the user
   */
  public last_name: string
  /**
   * The id of the user
   */
  public id: number

  /**
   * creates a new AvailableUsersForCompany object
   * @param email
   * @param first_name
   * @param last_name
   * @param id
   */
  public constructor (email: string, first_name: string, last_name: string, id: number) {
    this.email = email
    this.first_name = first_name
    this.last_name = last_name
    this.id = id
  }
}
