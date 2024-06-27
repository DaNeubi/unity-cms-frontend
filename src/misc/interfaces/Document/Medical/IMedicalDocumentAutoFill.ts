import IBaseObject from 'src/misc/interfaces/IBaseObject'
import AutofillType from 'src/misc/Enums/Medical/AutofillType'

export default interface IMedicalDocumentAutoFill extends IBaseObject {
  /**
   * The content of the autofill
   */
  content: string
  /**
   *
   */
  description: string
  /**
   * The type of the autofill
   */
  autofillType: AutofillType
}
