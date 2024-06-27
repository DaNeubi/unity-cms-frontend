import NotificationType from 'src/misc/Enums/Notification/NotificationType'

export class generalNotification {
  /**
   * Sender of the notification
   */
  public sender = ''
  /**
   * The message for the users
   */
  public message = ''
  /**
   * notification type
   */
  public type: NotificationType = NotificationType.Info
}

export default class GeneralNotification {
  generalNotification: generalNotification

  public constructor (result: generalNotification) {
    this.generalNotification = result
  }
}
