export class companyEditedResult {
  /**
   * Name of the company where changes happened
   */
  public companyName = ''

  /**
   * The user that changed something
   */
  public user = ''

  /**
   * Time the change happened
   */
  public dateTime = new Date()

  /**
   * If the job failed or succeeded
   */
  public result = false

  /**
   * Result of the change for the company
   * @param companyName
   * @param user
   * @param dateTime
   * @param result
   */
  public constructor (companyName: string, user: string, dateTime: Date, result: boolean) {
    this.companyName = companyName
    this.user = user
    this.dateTime = dateTime
    this.result = result
  }
}

export default class CompanyEditedResult {
  companyEditedResult: companyEditedResult

  public constructor (result: companyEditedResult) {
    this.companyEditedResult = result
  }
}
