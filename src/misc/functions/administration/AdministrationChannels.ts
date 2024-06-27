import laravelEcho from 'boot/laravelecho'
import { date, useQuasar } from 'quasar'
import CompanyEditedResult from 'src/misc/classes/Administration/CompanyEditedResult'
import formatDate = date.formatDate

export default class AdministrationChannels {
  public async subscribeToAdministrationChannels () {
    const $q = useQuasar()
    // Administration - Company
    laravelEcho.private('admin.company').listen('.admin.company.updated', (m: CompanyEditedResult) => {
      const msg = `${m.companyEditedResult.user} hat um
      ${formatDate(m.companyEditedResult.dateTime, 'DD.MM.YYYY - HH:mm:ss')} die Firma
      ${m.companyEditedResult.companyName}
      ${m.companyEditedResult.result ? 'Erfolgreich' : 'nicht Erfolgreich'} bearbeitet.`
      $q.notify({
        color: 'info',
        position: 'top-right',
        message: msg,
        icon: 'mdi-information-outline',
        progress: true,
        timeout: 7000,
        closeBtn: 'Ja, habs kapiert'
      })
    })
  }
}
