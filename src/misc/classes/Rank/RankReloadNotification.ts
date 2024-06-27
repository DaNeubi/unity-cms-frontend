import Rank from 'src/misc/classes/Rank/Rank'

class UserNotification {
  rank: Rank | null = null
}

export default class RankReloadNotification {
  userNotification: UserNotification | undefined
}
