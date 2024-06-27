export default class Permission {
  /**
   * Description of the Policy in German
   */
  public description = ''

  /**
   * Name of the Policy in English
   */
  public policy = ''

  /**
   * Name of the Policy in German
   */
  public name = ''

  /**
   * Category of the Policy
   */
  public category = ''

  /**
   * Policies that cannot exist with this policy
   */
  public cannotExistWith = []

  /**
   * If the policy has been selected
   * (used by the frontend for assigning permissions)
   */
  public selected = false
}
