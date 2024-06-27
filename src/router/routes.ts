import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'home', component: () => import('pages/IndexPage.vue') }]
  },
  {
    path: '/login',
    children: [{ path: '', name: 'login', component: () => import('pages/general/Login.vue') }]
  },
  {
    path: '/autologin/:token',
    name: 'autologin',
    component: () => import('pages/general/AutoLogin.vue')
  },
  {
    path: '/administration',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'notifications',
        component: () => import('pages/administration/AdministrationNotification.vue')
      },
      {
        path: 'companies',
        component: () => import('pages/administration/AdministrationCompanies.vue')
      },
      {
        path: 'employees',
        component: () => import('pages/administration/AdministrationEmployees.vue')
      },
      {
        path: 'employees/assignments',
        component: () => import('pages/administration/AdministrationEmployeeCompany.vue')
      },
      {
        path: 'transactions',
        component: () => import('pages/administration/AdministrationTransactions.vue')
      },
      {
        path: 'permissions',
        component: () => import('pages/administration/AdministrationPermissions.vue')
      },
      {
        path: 'vehicles',
        component: () => import('pages/administration/AdministrationVehicles.vue')
      },
      {
        path: 'modules',
        component: () => import('pages/administration/AdministrationComponentAssignment.vue')
      },
      {
        path: 'santospoints',
        component: () => import('pages/administration/AdministrationSantosCardPointAssignment.vue')
      },
      {
        path: 'external-access',
        component: () => import('pages/administration/AdministrationExternalRequests.vue')
      },
      {
        path: 'additional-user-information',
        component: () => import('pages/administration/AdministrationUserInformation.vue')
      },
      {
        path: 'user-provided-information',
        component: () => import('pages/administration/AdministrationUserInformationInformation.vue')
      },
      {
        path: 'external-permissions',
        component: () => import('pages/administration/AdministrationExternalPermissions.vue')
      }
    ]
  },
  {
    path: '/employee-management',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'permissions/:id',
        component: () => import('pages/employeeManagement/EmployeeRankPermissions.vue')
      },
      {
        path: 'add-employee/:id',
        component: () => import('pages/employeeManagement/HireEmployee.vue')
      },
      {
        path: 'employee-list/:id',
        component: () => import('pages/employeeManagement/EmployeeList.vue')
      },
      {
        path: 'ranks/:id',
        component: () => import('pages/employeeManagement/EmployeeRanks.vue')
      },
      {
        path: 'left-employees/:id',
        component: () => import('pages/employeeManagement/LeftEmployees.vue')
      },
      {
        path: 'genders/:id',
        component: () => import('pages/employeeManagement/EmployeeGenders.vue')
      },
      {
        path: 'applicants/:id',
        component: () => import('pages/employeeManagement/UserApplicant.vue')
      },
      {
        path: 'check-list/:id',
        component: () => import('pages/employeeManagement/EmployeeCheckList.vue')
      }
    ]
  },
  {
    path: '/government',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'balance-view',
        component: () => import('pages/government/GovernmentBalanceView.vue')
      },
      {
        path: 'employee-list',
        component: () => import('pages/government/GovernmentEmployeeList.vue')
      },
      {
        path: 'transaction-list',
        component: () => import('pages/government/GovernmentTransactionList.vue')
      },
      {
        path: 'payment-list',
        component: () => import('pages/government/GovernmentPaymentList.vue')
      },
      {
        path: 'vehicles-list',
        component: () => import('pages/government/GovernmentVehicleList.vue')
      }
    ]
  },
  {
    path: '/product-management',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'products/:id',
        component: () => import('pages/productManagement/ArticleList.vue')
      },
      {
        path: 'menus/:id',
        component: () => import('pages/productManagement/MenuList.vue')
      },
      {
        path: 'types/:id',
        component: () => import('pages/productManagement/ArticleTypeList.vue')
      },
      {
        path: 'categories/:id',
        component: () => import('pages/productManagement/ArticleCategoryList.vue')
      },
      {
        path: 'stock/:id',
        component: () => import('pages/productManagement/ArticleStockList.vue')
      }
    ]
  },
  {
    path: '/general-management',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'discount/:id',
        component: () => import('pages/generalManagement/CompanyDiscounts.vue')
      },
      {
        path: 'accounting/:id',
        component: () => import('pages/generalManagement/CompanyAccounting.vue')
      },
      {
        path: 'company-settings/:id',
        component: () => import('pages/generalManagement/CompanySettings.vue')
      },
      {
        path: 'company-panel/:id',
        component: () => import('pages/generalManagement/CompanyPanel.vue')
      },
      {
        path: 'news-board/:id',
        component: () => import('pages/generalManagement/CompanyNewsBoard.vue')
      },
      {
        path: 'company-cars/:id',
        component: () => import('pages/generalManagement/CompanyCars.vue')
      },
      {
        path: 'company-applicant-settings/:id',
        component: () => import('pages/generalManagement/CompanyApplicantSettings.vue')
      },
      {
        path: 'external-access/:id',
        component: () => import('pages/generalManagement/CompanyExternalAccess.vue')
      },
      {
        path: 'radio-settings/:id',
        component: () => import('pages/generalManagement/CompanyRadio.vue')
      },
      {
        path: 'taxmax-car-status/:id',
        component: () => import('pages/generalManagement/CompanyTaxMaxSettings.vue')
      }
    ]
  },
  {
    path: '/documents',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'types/:id',
        component: () => import('pages/documents/DocumentType.vue')
      },
      {
        path: 'classifications/:id',
        component: () => import('pages/documents/DocumentClassification.vue')
      },
      {
        path: 'templates/:id',
        component: () => import('pages/documents/DocumentTemplate.vue')
      },
      {
        path: 'templates/:id/modify/:templateId/:name',
        component: () => import('pages/documents/DocumentTemplateModify.vue')
      }
    ]
  },
  {
    path: '/balance',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'all-employees/:id',
        component: () => import('pages/balanceView/BalanceAllEmployees.vue')
      },
      {
        path: 'self/:id',
        component: () => import('pages/balanceView/BalanceSelf.vue')
      },
      {
        path: 'fancy-graphs/:id',
        component: () => import('pages/balanceView/BalanceFancyGraphs.vue')
      },
      {
        path: 'payment/:id',
        component: () => import('pages/balanceView/BalancePayment.vue')
      },
      {
        path: 'employee-statistics/:id',
        component: () => import('pages/balanceView/BalanceEmployeeStatistics.vue')
      },
      {
        path: 'company-balance/:id',
        component: () => import('pages/balanceView/BalanceCompanyBalance.vue')
      },
      {
        path: 'company-statistics/:id',
        component: () => import('pages/balanceView/BalanceCompanyStatistics.vue')
      }
    ]
  },
  {
    path: '/contract',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'contracts/:id',
        component: () => import('pages/contract/ContractList.vue')
      },
      {
        path: 'booking/:id',
        component: () => import('pages/contract/ContractBooking.vue')
      },
      {
        path: 'billing/:id',
        component: () => import('pages/contract/ContractBilling.vue')
      },
      {
        path: 'b2b/:id',
        component: () => import('pages/contract/ContractB2BList.vue')
      }
    ]
  },
  {
    path: '/transaction-history/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/transactionHistory/TransactionHistoryMain.vue')
      }
    ]
  },
  {
    path: '/shopping-list/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/shoppingList/shoppingList.vue')
      }
    ]
  },
  {
    path: '/custom-products',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'refuel/:id',
        component: () => import('pages/nonListedProducts/nonListedProductsRefuel.vue')
      },
      {
        path: 'customs/:id',
        component: () => import('pages/nonListedProducts/nonListedProducts.vue')
      }
    ]
  },
  {
    path: '/contact-management',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'main/:id',
        component: () => import('pages/contactManagement/contactManagementMain.vue')
      },
      {
        path: 'person/:companyId/:userId',
        component: () => import('pages/contactManagement/contactManagementPersonPage.vue')
      },
      {
        path: 'person-create/:id',
        component: () => import('pages/contactManagement/contactManagementPersonCreation.vue')
      }
    ]
  },
  {
    path: '/documents',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'medizinische-akte/:companyId/:userId',
        component: () => import('pages/medicalFiles/MedicalFileMainPage.vue')
      }
    ]
  },
  {
    path: '/user',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('layouts/UserMenuLayout.vue'),
        children: [
          {
            path: 'main',
            component: () => import('pages/user/userMainPage.vue')
          },
          {
            path: 'additional-information',
            component: () => import('pages/user/userInformationPage.vue')
          },
          {
            path: 'vehicles',
            component: () => import('pages/user/UserVehiclesPage.vue')
          },
          {
            path: 'vehicle-list',
            component: () => import('pages/user/VehicleListPage.vue')
          },
          {
            path: 'settings',
            component: () => import('pages/user/UserSettingsPage.vue')
          },
          {
            path: 'friend-list',
            component: () => import('pages/user/UserFriendListPage.vue')
          }
        ]
      },
      {
        path: 'onboarding',
        component: () => import('pages/user/OnBoardingPage.vue')
      }
    ]
  },
  {
    path: '/cash-register/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/cashRegister/oldFoodCashRegister.vue')
      }
    ]
  },
  {
    path: '/taxmax/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/taxmax/TaxMax.vue') }
    ]
  },
  {
    path: '/calendar/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/calendar/calendar.vue') }
    ]
  },
  {
    path: '/race',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'management/:id',
        component: () => import('pages/raceManagement/RaceManagement.vue')
      },
      {
        path: 'racelocker/:id',
        component: () => import('pages/raceManagement/RaceLocker.vue'),
        children: [
          {
            path: 'race/:raceId',
            component: () => import('pages/raceManagement/RaceLockerRace.vue')
          }
        ]
      },
      {
        path: 'publicRace/:raceId',
        component: () => import('pages/raceManagement/PublicRaceLocker.vue')
      }
    ]
  },
  {
    path: '/statistics',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'products/:id',
        component: () => import('pages/statistics/ProductStatistics.vue')
      }
    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
