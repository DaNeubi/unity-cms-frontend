import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface ICompanyModuleAccess extends IBaseObject {
  id: number
  company_id: number
  lst: boolean
  elst: boolean
  dms: boolean
  crm: boolean
  er: boolean
  fms: boolean
  rtl: boolean
  wms: boolean
  cms: boolean
  cal: boolean
  taxmax: boolean
  statistics: boolean
}
