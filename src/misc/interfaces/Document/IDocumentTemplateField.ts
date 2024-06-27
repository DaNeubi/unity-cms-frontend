import IDocumentTemplate from 'src/misc/interfaces/Document/IDocumentTemplate'
import IDocumentField from 'src/misc/interfaces/Document/IDocumentField'

export default interface IDocumentTemplateField {
  /**
   * id of the document template field
   */
  id: string
  /**
   * id of the document template this field belongs to
   */
  document_template_id?: number
  /**
   * document template this field belongs to
   */
  document_template?: IDocumentTemplate
  /**
   * id of the document field this template field belongs to
   */
  document_field_id?: number
  /**
   * document field this template field belongs to
   */
  document_field?: IDocumentField
  /**
   * value of the document template field
   */
  value: string
  /**
   * position of the document template field
   */
  position: {x: number; y: number, h: number, w: number }
}
