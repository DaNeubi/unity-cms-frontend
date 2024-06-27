import ICompanyModuleAccess from 'src/misc/interfaces/Company/ICompanyModuleAccess'

export class CompanyModuleAccess {
  cms = false
  company_id = 0
  crm = false
  dms = false
  elst = false
  er = false
  fms = false
  id = 0
  lst = false
  rtl = false
  wms = false
  cal = false
  taxmax = false
  statistics = false

  /**
   * returns a array of all available modules with their description
   */
  public getModuleAccessArray (): { name: string, description: string}[] | [] {
    // iterate through the object and push the values into an array
    const moduleAccessArray: { name: string, description: string}[] | [] = []
    let counter = 0
    if (this.lst) {
      moduleAccessArray[counter] = { name: 'Leitstellen Modul', description: 'Erlaubt einen Überblick, welche Personen gerade eingestempelt sind.' }
      counter++
    }
    if (this.elst) {
      moduleAccessArray[counter] = { name: 'Erweitertes Leitstellen Modul', description: 'Fügt zusätzlich eine live Kartenansicht der Firmenfahrzeuge hinzu.' }
      counter++
    }
    if (this.dms) {
      moduleAccessArray[counter] = { name: 'Dokumenten Verwaltungs System', description: 'Erlaubt das Verwalten, Erstellen und Bearbeiten von Dokumenten.' }
      counter++
    }
    if (this.crm) {
      moduleAccessArray[counter] = { name: 'Personen Verwaltung', description: 'Erlaubt das Verwalten von Kunden/Personen und deren Daten.' }
      counter++
    }
    if (this.er) {
      moduleAccessArray[counter] = { name: 'Einsatzplanung', description: 'Erlaubt das Verwalten von Einsätzen.' }
      counter++
    }
    if (this.fms) {
      moduleAccessArray[counter] = { name: 'Fahrzeug Verwaltungs System', description: 'Erlaubt das Verwalten von Firmenfahrzeugen.' }
      counter++
    }
    if (this.rtl) {
      moduleAccessArray[counter] = { name: 'Waren Verkaufs System', description: 'Erlaubt das Verkaufen von Produkten in einer Kasse' }
      counter++
    }
    if (this.wms) {
      moduleAccessArray[counter] = { name: 'Warenbestand Verwaltungs System', description: 'Erlaubt das erstellen und verwalten von Warenbeständen.' }
      counter++
    }
    if (this.cms) {
      moduleAccessArray[counter] = { name: 'Vertrags Verwaltungs System', description: 'Erlaubt das Erstellen und Verwalten von Verträgen.' }
      counter++
    }
    if (this.cal) {
      moduleAccessArray[counter] = { name: 'Kalender', description: 'Erlaubt das Erstellen von Terminen und das Verwalten von Terminen.' }
      counter++
    }
    if (this.taxmax) {
      moduleAccessArray[counter] = { name: 'Taxmax', description: 'Erlaubt das Verwalten von Fahrten.' }
      counter++
    }
    if (this.statistics) {
      moduleAccessArray[counter] = { name: 'Statistik', description: 'Erlaubt das Anzeigen von Statistiken.' }
      counter++
    }
    return moduleAccessArray
  }

  /**
   * sets the modules the company has access to
   * @param modules
   */
  public setModules (modules: ICompanyModuleAccess | null | undefined): void {
    if (!modules) return
    modules.cms ? this.cms = true : this.cms = false
    modules.crm ? this.crm = true : this.crm = false
    modules.dms ? this.dms = true : this.dms = false
    modules.elst ? this.elst = true : this.elst = false
    modules.er ? this.er = true : this.er = false
    modules.fms ? this.fms = true : this.fms = false
    modules.lst ? this.lst = true : this.lst = false
    modules.rtl ? this.rtl = true : this.rtl = false
    modules.wms ? this.wms = true : this.wms = false
    modules.cal ? this.cal = true : this.cal = false
    modules.taxmax ? this.taxmax = true : this.taxmax = false
    modules.statistics ? this.statistics = true : this.statistics = false
  }
}
