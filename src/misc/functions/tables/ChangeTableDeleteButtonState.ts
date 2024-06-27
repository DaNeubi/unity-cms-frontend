import ITableSelected from 'src/misc/interfaces/General/Table/ITableSelected'

/**
 * checks if a delete button should be enabled or not
 * @param selected
 * @param multiple
 * @param selectedObjectsCount
 * @constructor
 */
export default function ChangeTableDeleteButtonState (selected: ITableSelected, multiple = false
  , selectedObjectsCount = 0): boolean {
  // first check if this is a multi or single selection
  if (multiple) {
    // check the selection state
    if (selected.added) {
      // always true, because we added one item and now have at least one item
      return true
    } else {
      // check if we have at least one item remaining
      if ((selectedObjectsCount - 1) > 0) {
        // we have at least one item remaining
        return true
      }
    }
    return false
  } else {
    return selected.added
  }
}
