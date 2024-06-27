import Rank from 'src/misc/classes/Rank/Rank'
import Gender from 'src/misc/classes/Gender/Gender'
import Note from 'src/misc/classes/Note/Note'

export default class User {
  public id = 0
  public first_name = ''
  public last_name = ''
  public phone = ''
  public email = ''
  public created_at = ''
  public bank_account_number = ''
  public ranks: Rank[] | null = null
  public genders: Gender[] | null = null
  public notes: Note[] | null = null
  public joined_at: Date | null = null
}
