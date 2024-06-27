export default interface IUserVehicleColor {
  /**
   * id of the color
   */
  id: number
  /**
   * id of the vehicle this color belongs to
   */
  user_vehicle_id: number
  /**
   * name of the color
   */
  name: string
  /**
   * hexa string
   */
  hexa_color: string
  /**
   * when the color was created
   */
  created_at?: string
  /**
   * when the color was last updated
   */
  updated_at?: string
}
