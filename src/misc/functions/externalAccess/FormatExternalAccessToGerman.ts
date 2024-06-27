export default function formatExternalAccessToGerman (area: number): string {
  switch (area) {
    case 1:
      return 'Mitarbeiterübersicht'
    case 2:
      return 'Billanz Übersicht'
    case 3:
      return 'Transaktionsliste'
    case 4:
      return 'Zahlungs Liste'
    case 5:
      return 'Firmenfahrzeuge'
    default:
      return 'Unbekannt'
  }
}
