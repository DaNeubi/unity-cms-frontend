import User from 'src/misc/classes/User/User'

export class PackedUser {
  company_id: number
  user_id: number
  user: User
  joined_at: Date

  constructor (CompanyId: number, UserId: number, User: User, JoinedAt: Date) {
    this.company_id = CompanyId
    this.user_id = UserId
    this.user = User
    this.joined_at = JoinedAt
  }
}
