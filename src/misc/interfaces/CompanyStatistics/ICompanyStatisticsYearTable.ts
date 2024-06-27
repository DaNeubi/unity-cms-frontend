import ICompanyStatisticsYearTableMonth from 'src/misc/interfaces/CompanyStatistics/ICompanyStatisticsYearTableMonth'

export default interface ICompanyStatisticsYearTable {
  year: string
  months?: ICompanyStatisticsYearTableMonth[]
}
