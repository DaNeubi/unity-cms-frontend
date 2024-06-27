import IBaseObject from 'src/misc/interfaces/IBaseObject'
import { ICompanyPanelRank } from 'src/misc/interfaces/CompanyPanel/ICompanyPanelRank'

export interface ICompanyPanel extends IBaseObject {
  /**
   * id of the panel
   */
  id: number
  /**
   * name of the panel
   */
  name: string
  /**
   * url of the panel
   */
  url: string
  /**
   * all the rank id's of the panel that are allowed to see the panel, if empty all ranks can see the panel
   */
  rank_panels: ICompanyPanelRank[]
  created_at: string
  updated_at: string
}
