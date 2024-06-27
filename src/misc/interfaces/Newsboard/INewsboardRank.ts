import IBaseObject from 'src/misc/interfaces/IBaseObject'

export interface INewsboardRank extends IBaseObject{
  /**
   * id of the associated rank
   */
  rank_id: number
  /**
   * id of the associated company
   */
  company_id: number
  /**
   * id of the associated newsboard
   */
  company_newsboard_id: number | undefined
  /**
   * if the intermediate needs to be saved
   * not in the database
   */
  needsToBeSaved: boolean
}

export default INewsboardRank
