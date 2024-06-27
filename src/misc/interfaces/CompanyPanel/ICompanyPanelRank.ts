export interface ICompanyPanelRank {
  /**
   * id of the associated rank
   */
  rank_id: number;
  /**
   * id of the associated company
   */
  company_id: number;
  /**
   * id of the associated panel
   */
  company_panel_id: number;
  needsToBeSaved: boolean;
}
