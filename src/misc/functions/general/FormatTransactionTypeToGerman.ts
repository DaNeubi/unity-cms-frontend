/**
 * Formats the transaction type to german
 * @param number
 * @constructor
 */
export default function FormatTransactionTypeToGerman (number: number) {
  switch (number) {
    case 1:
      return 'Einkauf'
    case 2:
      return 'Verkauf'
    case 3:
      return 'Mitarbeiterentnahme'
    case 4:
      return 'Metro Einkauf mit Bar Geld'
    case 5:
      return 'Metro Einkauf mit Karte (vom Firmenkonto)'
    case 6:
      return 'Tanken'
    case 7:
      return 'Nicht gelistete Produkte Einkauf/Ausgabe'
    case 8:
      return 'Nicht gelistete Produkte Verkauf/Einnahme'
    case 9:
      return 'Aus Vertragsbuchung'
    case 10:
      return 'Einkauf aus Verkauf'
    case 11:
      return 'Trinkgeld Buchung'
    default:
      return 'Unbekannt'
  }
}
