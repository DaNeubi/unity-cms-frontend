import ReloadType from 'src/misc/Enums/Reload/ReloadType'

export interface IUserGeneralReloadNotification {
  type: ReloadType
}

export default interface IGeneralReloadNotification {
  userNotification: IUserGeneralReloadNotification;
}
