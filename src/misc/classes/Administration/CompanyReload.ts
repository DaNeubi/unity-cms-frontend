import { IReloadEvent } from 'src/misc/interfaces/IReloadEvent'
import ReloadType from 'src/misc/Enums/Reload/ReloadType'

export default class CompanyReload implements IReloadEvent {
  /**
   * Type of reload
   */
  type: ReloadType = ReloadType.Update
  /**
   * id of the company
   */
  companyId: number | null = null
  /**
   * Name of the company
   */
  name: string | null = null
  /**
   * Logo of the company
   */
  logo: string | null = null
  /**
   * Bank account number of the company
   */
  bank_account_number: string | null = null
  /**
   * Phone number of the company
   */
  phone_number: string | null = null
  /**
   * Created at of the company
   */
  created_at: Date | null = null
  /**
   * Updated at of the company
   */
  user_limit: number | null = null
}
