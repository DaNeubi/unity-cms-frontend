import IBaseObject from '../IBaseObject'

export default interface ITransactionNonItem extends IBaseObject {
   /**
    * ID of the transaction non item
    */
   id: number
   /**
    * name of the transaction non item
    */
   name: string
   /**
    * description of the transaction non item
    */
   description: string
   /**
    * selling price of the transaction non item
    */
   selling_price: number
   /**
    * amount of the transaction non item
    */
   amount: number
   /**
    * the id of the transaction the transactionNonItem belongs to
    */
   transaction_id: number
   /**
    * the id of the company the transactionNonItem belongs to
    */
   company_id: number
   created_at: Date
   updated_at: Date
}
