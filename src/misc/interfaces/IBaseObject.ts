import User from 'src/misc/classes/User/User'
import Company from 'src/misc/classes/company/Company'
import Rank from 'src/misc/classes/Rank/Rank'
import { IItem } from 'src/misc/interfaces/Item/IItem'
import IItemType from 'src/misc/interfaces/Item/IItemType'
import { IItemStockItem } from 'src/misc/interfaces/Item/IItemStockItem'
import { IItemStockItemType } from 'src/misc/interfaces/Item/IItemStockItemType'
import { ICompanyPanelRank } from 'src/misc/interfaces/CompanyPanel/ICompanyPanelRank'
import { ITransactionItem } from 'src/misc/interfaces/Transaction/ITransactionItem'
import Note from '../classes/Note/Note'
import Gender from '../classes/Gender/Gender'
import IUser from 'src/misc/interfaces/User/IUser'
import IVehicle from 'src/misc/interfaces/Vehicle/IVehicle'
import ICompanyCarVehicle from 'src/misc/interfaces/CompanyCar/ICompanyCarVehicle'
import ITransactionNonItem from 'src/misc/interfaces/Transaction/ITransactionNonItem'
import IPersonMedicalStatus from 'src/misc/interfaces/Person/IPersonMedicalStatus'
import ICompanyOwner from 'src/misc/interfaces/Company/ICompanyOwner'
import ICompanyModuleAccess from 'src/misc/interfaces/Company/ICompanyModuleAccess'
import ICompanySantosPointsSettings from 'src/misc/interfaces/Company/IcompanySantosPointsSettings'
import { ITransaction } from 'src/misc/interfaces/Transaction/ITransaction'
import IPerson from 'src/misc/interfaces/Person/IPerson'
import IDocumentType from 'src/misc/interfaces/Document/IDocumentType'
import IDocumentField from 'src/misc/interfaces/Document/IDocumentField'
import IDocumentTemplate from 'src/misc/interfaces/Document/IDocumentTemplate'
import IBalanceViewTransaction from 'src/misc/interfaces/Transaction/IBalanceViewTransaction'
import IItemMenuCategory from 'src/misc/interfaces/Item/IItemMenuCategory'
import IItemMenu from 'src/misc/interfaces/Item/IItemMenu'
import IContract from 'src/misc/interfaces/Contract/IContract'
import IRace from 'src/misc/interfaces/Race/IRace'
import ICompanyCar from 'src/misc/interfaces/CompanyCar/ICompanyCar'
import IRaceParticipant from 'src/misc/interfaces/Race/IRaceParticipant'
import IRaceVehicle from 'src/misc/interfaces/Race/IRaceVehicle'
import IRaceVehicleLap from 'src/misc/interfaces/Race/IRaceVehicleLap'
import IRaceVehiclePitstop from 'src/misc/interfaces/Race/IRaceVehiclePitstop'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
import IUserInformationField from 'src/misc/interfaces/User/IUserInformationField'
import IUserVehicleTuning from 'src/misc/interfaces/UserVehicle/IUserVehicleTuning'
import IUserVehicleRemoval from 'src/misc/interfaces/UserVehicle/IUserVehicleRemoval'
import ICompanyCarDriver from 'src/misc/interfaces/CompanyCar/ICompanyCarDriver'
import IVehicleManufacturer from 'src/misc/interfaces/Vehicle/IVehicleManufacturer'
import IVehicleCategory from 'src/misc/interfaces/Vehicle/IVehicleCategory'
import IVehicleFuelType from 'src/misc/interfaces/Vehicle/IVehicleFuelType'
import IUserVehicleColor from 'src/misc/interfaces/UserVehicle/IUserVehicleColor'
import ICompany from 'src/misc/interfaces/Company/ICompany'

export default interface IBaseObject {
  [key: string]: string | number | number[] | boolean | undefined | null | Date | User
    | Company | Rank | IItem[] | IItemType[] | IItem | IItemType | IItemStockItem | IItemStockItemType
    | IItemStockItem[] | IItemStockItemType[] | ICompanyPanelRank[] | ITransactionItem[] | ITransactionItem
    | Rank[] | Gender[] | Note[] | IUser[] | IUser | IVehicle | ICompanyCarVehicle | ITransactionNonItem
    | IPersonMedicalStatus | ICompanyOwner[] | ICompanyModuleAccess | ICompanySantosPointsSettings | ITransaction
    | IPerson | IDocumentType | IDocumentField | JSON | IDocumentTemplate | IBalanceViewTransaction[]
    | IItemMenuCategory[] | IItemMenuCategory | IItemMenu[] | IItemMenu | IContract | IContract[] | IRace
    | ICompanyCar | IRaceParticipant | IRaceVehicle | IRaceVehicleLap[] | IRaceVehiclePitstop[] | IRaceVehiclePitstop
    | IRaceVehicle[] | IRaceParticipant[] | ICompanySetting | IUserInformationField | IUserVehicleTuning
    | IUserVehicleRemoval | ICompanyCarDriver[] | IVehicleManufacturer | IVehicleCategory | IVehicleFuelType
    | IUserVehicleColor[] | IUserVehicleColor | ICompany[]
}
