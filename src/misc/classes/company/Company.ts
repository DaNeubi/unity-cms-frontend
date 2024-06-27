import ICompanyOwner from 'src/misc/interfaces/Company/ICompanyOwner'

export default class Company {
  /**
   * Company ID
   */
  public id = 0
  public name = ''
  public logo = ''
  public bank_account_number = ''
  public phone_number = ''
  public created_at = ''
  public user_limit = 0
  public owners?: ICompanyOwner[]
}
