import ICompanyRadio from 'src/misc/interfaces/Radio/ICompanyRadio'
import ICompanyCar from 'src/misc/interfaces/CompanyCar/ICompanyCar'
import ICompanyCarDriver from 'src/misc/interfaces/CompanyCar/ICompanyCarDriver'
import IDriveLogBook from 'src/misc/interfaces/DriveLogBook/IDriveLogBook'

export default interface ITaxMaxChangedEvent {
  /**
   * the radio that was changed
   */
  changedRadio?: ICompanyRadio | null
  /**
   * the car that was changed
   */
  changedCar?: ICompanyCar | null
  /**
   * the car that has been removed
   */
  removedCar?: ICompanyCar | null
  /**
   * the driver that was removed
   */
  removedDriver?: ICompanyCarDriver | null
  /**
   * created or updated drive log book and company_car_id
   */
  updatedDriveLogBook?: IDriveLogBook | null
  /**
   * deleted drive log book and company_car_id
   */
  deletedDriveLogBook?: IDriveLogBook | null
}
