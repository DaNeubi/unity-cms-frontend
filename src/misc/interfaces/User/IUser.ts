import Rank from 'src/misc/classes/Rank/Rank'
import IBaseObject from '../IBaseObject'
import Gender from 'src/misc/classes/Gender/Gender'
import Note from 'src/misc/classes/Note/Note'
import IBalanceViewTransaction from 'src/misc/interfaces/Transaction/IBalanceViewTransaction'
import ICompany from 'src/misc/interfaces/Company/ICompany'

export default interface IUser extends IBaseObject {
  /**
   * Id of the user
   */
  id: number
  /**
   * First name of the user
   */
  first_name: string
  /**
   * Last name of the user
   */
  last_name: string
  /**
   * Phone number of the user
   */
  phone: string
  /**
   * Email of the user
   */
  email: string
  /**
   * Date when the user was created
   */
  created_at: string
  /**
   * Bank account number of the user
   */
  bank_account_number: string
  /**
   * Ranks of the user
   */
  ranks: Rank[] | undefined
  /**
   * genders of the user
   */
  genders: Gender[] | undefined
  /**
   * notes of the user
   */
  notes: Note[] | undefined
  /**
   * all transactions of the user
   */
  transactions?: IBalanceViewTransaction[] | undefined
  /**
   * all companies the user is associated with
   */
  companies?: ICompany[] | undefined
  /**
   * if the user is associated with a company car, this is the id of the company car
   */
  company_car_id?: number | null
}
