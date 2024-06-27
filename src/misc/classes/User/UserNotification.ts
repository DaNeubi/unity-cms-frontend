import NotificationType from 'src/misc/Enums/Notification/NotificationType'

export class userNotification {
  /**
   * The message for the user
   */
  public message = ''
  /**
   * The message result type
   */
  public notificationType: NotificationType = NotificationType.Info
}

export default class UserNotification {
  userNotification: userNotification

  public constructor (result: userNotification) {
    this.userNotification = result
  }
}
