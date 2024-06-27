export interface ITableSelected {
  /**
   * Array of row objects that were selected/unselected
   * required!
   */
  rows: []
  /**
   * Array of the keys of rows that were selected/unselected
   * required!
   */
  keys: []
  /**
   * Were the rows added to selection (true) or removed from selection (false)
   * required!
   */
  added: boolean
  /**
   * JS event object
   * required!
   */
  evt: Event
}

export default ITableSelected
