export default class TableHeader {
  /**
   * Row Key for the table header
   * Has to be unique
   * identifies column
   */
  public name = ''
  /**
   * label for the header
   */
  public label = ''
  /**
   * object property to get the value for the column
   * (name of the query row header)
   */
  public field = ''
  /**
   * if true, the column is sortable
   */
  public sortable = false
  /**
   * The alignment of the column
   */
  public align = ''
  /**
   * The order of the column
   */
  public order = 0

  public constructor (name: string, label: string, field: string, sortable: boolean, order = 0, align = 'left') {
    this.name = name
    this.label = label
    this.field = field
    this.sortable = sortable
    this.align = align
    this.order = order
  }
}
