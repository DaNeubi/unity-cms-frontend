import NotificationType from 'src/misc/Enums/Notification/NotificationType'

export class userAccountingReloadNotification {
  /**
   * The message for the user
   */
  public message = ''
  /**
   * The message result type
   */
  public notificationType: NotificationType = NotificationType.Info
  /**
   * if the event is about tax
   */
  public isTax = false
  /**
   * if the event is about the user share
   */
  public isUserShare = false
  /**
   * if the event is about the user always share
   */
  public isUserAlwaysShare = false
  /**
   * if the event is about the balance view time and duration
   */
  public isBalanceViewThing = false
}

export default class UserAccountingReloadNotification {
  userNotification: userAccountingReloadNotification

  public constructor (result: userAccountingReloadNotification) {
    this.userNotification = result
  }
}
