<template>
  <q-list separator class="full-width" v-if="availableRaces !== undefined && availableRaces?.length > 0">
    <q-item clickable v-ripple :to="`/race/publicRace/${availableRaces[0].id}`"
            v-if="availableRaces.length === 1"
            class="attention-seeker-racelocker text-black text-bold">
      <q-item-section avatar>
        <q-icon name="mdi-flag-checkered"/>
      </q-item-section>
      <q-item-section>Racelocker</q-item-section>
    </q-item>
    <q-expansion-item expand-icon="mdi-chevron-down" label="Race Locker"
                      class="attention-seeker-racelocker" header-class="text-black text-bold"
                      expand-icon-class="text-black" icon="mdi-flag-checkered" v-else>
      <q-item clickable v-ripple :to="`/race/publicRace/${currentRace.id}`"
              v-for="currentRace in availableRaces" :key="currentRace.id"
              class="text-black text-bold custom-race-locker-shadow">
        <q-item-section avatar>
          <q-icon name="mdi-car-clock"/>
        </q-item-section>
        <q-item-section>
          {{ currentRace.company?.name }} - {{ currentRace.name }}
        </q-item-section>
      </q-item>
    </q-expansion-item>
  </q-list>
  <q-list separator class="full-width"
          v-if="availableNavigationPolicies !== undefined">
      <q-item clickable v-ripple to="/">
          <q-item-section avatar>
              <q-icon name="mdi-home"/>
          </q-item-section>
          <q-item-section>Home</q-item-section>
      </q-item>
    <q-separator />
    <div v-if="companyPanels !== undefined && companyPanels?.length > 1">
      <q-expansion-item label="Firmen Panel" expand-icon="mdi-chevron-down" icon="mdi-domain">
        <q-item v-for="companyPanel in companyPanels"
                v-ripple
                clickable
                :href="companyPanel.url"
                target="_blank"
                :key="companyPanel.id">
          <q-item-section avatar>
            <q-icon name="mdi-domain"/>
          </q-item-section>
          <q-item-section>
            {{ companyPanel.name }}
          </q-item-section>
        </q-item>
      </q-expansion-item>
      <q-separator />
    </div>
    <div v-else-if="companyPanels !== undefined && companyPanels?.length > 0">
      <q-item v-ripple
              clickable
              :href="companyPanels[0]?.url"
              target="_blank">
        <q-item-section avatar>
          <q-icon name="mdi-domain"/>
        </q-item-section>
        <q-item-section>
          {{ companyPanels[0]?.name }}
        </q-item-section>
      </q-item>
      <q-separator />
    </div>
      <q-expansion-item label="Administration" expand-icon="mdi-chevron-down" icon="mdi-shield-account"
                        v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_Navigation')">
          <q-item v-ripple clickable to="/administration/notifications"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_Notification_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-bell"/>
            </q-item-section>
            <q-item-section>
              Benachrichtigungen
            </q-item-section>
          </q-item>
          <q-item v-ripple clickable to="/administration/companies"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_Company_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-home-city"/>
            </q-item-section>
            <q-item-section>
              Gewerbe
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/administration/employees"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_User_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-account-multiple"/>
            </q-item-section>
            <q-item-section>Mitarbeiter</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/administration/employees/assignments"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_User_Company_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-account-group"/>
            </q-item-section>
            <q-item-section>Mitarbeiter - Gewerbe Zuweisung</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/administration/transactions"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_Transactions_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-view-list"/>
              </q-item-section>
              <q-item-section>Transaktionen</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/administration/permissions"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_Permissions_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-security"/>
              </q-item-section>
              <q-item-section>Berechtigungs Verwaltung</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/administration/vehicles"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_Vehicle_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-tank"/>
            </q-item-section>
            <q-item-section>Fahrzeug Verwaltung</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/administration/modules"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_Company_Module_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-database"/>
            </q-item-section>
            <q-item-section>Gewerbe Modul Verwaltung</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/administration/santospoints"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_Company_Module_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-card-bulleted-outline"/>
            </q-item-section>
            <q-item-section>SantosCard Verwaltung</q-item-section>
          </q-item>
        <q-item clickable v-ripple to="/administration/external-access"
                v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_ExternalAccess_Navigation')">
          <q-item-section avatar>
            <q-icon name="mdi-shield-account-variant"/>
          </q-item-section>
          <q-item-section>Externe Zugriffanfragen</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/administration/additional-user-information"
                v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_UserInformation_Navigation')">
          <q-item-section avatar>
            <q-icon name="mdi-account-details"/>
          </q-item-section>
          <q-item-section>User Informationen</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/administration/user-provided-information"
                v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_UserInformation_Data_Navigation')">
          <q-item-section avatar>
            <q-icon name="mdi-data-matrix"/>
          </q-item-section>
          <q-item-section>User Daten</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/administration/external-permissions"
                v-if="availableNavigationPolicies?.find(e => e.policy === 'Administration_Government_Permissions_Navigation')">
          <q-item-section avatar>
            <q-icon name="mdi-shield-lock"/>
          </q-item-section>
          <q-item-section>Externe Zug. Berechtig.</q-item-section>
        </q-item>
      </q-expansion-item>
      <q-item clickable v-ripple :to="`/calendar/${ companyId }`"
              v-if="availableNavigationPolicies?.find(e => e.policy === 'Calendar_Navigation') && companyId > 0">
        <q-item-section avatar>
          <q-icon name="mdi-calendar-month"/>
        </q-item-section>
        <q-item-section>Kalender</q-item-section>
      </q-item>
      <q-expansion-item label="Mitarbeiterverwaltung" expand-icon="mdi-chevron-down" icon="mdi-account-multiple"
                        v-if="availableNavigationPolicies?.find(e => e.policy === 'UserManagement_Navigation') && companyId > 0">
          <q-item clickable v-ripple :to="`/employee-management/employee-list/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'UserManagement_UserList_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-account-settings"/>
              </q-item-section>
              <q-item-section>Mitarbeiterübersicht</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/employee-management/check-list/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'UserManagement_UserList_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-playlist-check"/>
            </q-item-section>
            <q-item-section>Mitarbeiter Listen</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/employee-management/add-employee/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'UserManagement_AddUsers_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-account-plus"/>
              </q-item-section>
              <q-item-section>Mitarbeiter/in einstellen</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/employee-management/applicants/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'UserManagement_Applicants_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-account-details"/>
            </q-item-section>
            <q-item-section>Bewerber</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/employee-management/ranks/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'UserManagement_Ranks_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-account-lock"/>
              </q-item-section>
              <q-item-section>Ränge</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/employee-management/left-employees/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'UserManagement_LeftUsers_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-card-account-details"/>
              </q-item-section>
              <q-item-section>Ausgeschiedene Mitarbeiter/innen</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/employee-management/genders/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'UserManagement_Gender_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-gender-transgender"/>
              </q-item-section>
              <q-item-section>Geschlechter</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/employee-management/permissions/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'UserManagement_Permissions_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-security"/>
              </q-item-section>
              <q-item-section>Berechtigungen</q-item-section>
          </q-item>
      </q-expansion-item>
      <q-item clickable v-ripple :to="`/contact-management/main/${ companyId }`"
              v-if="availableNavigationPolicies.find(e => e.policy === 'ContactManagement_Navigation') && companyId > 0">
        <q-item-section avatar>
          <q-icon name="mdi-account-group"/>
        </q-item-section>
        <q-item-section>Personenkartei</q-item-section>
      </q-item>
      <q-expansion-item expand-icon="mdi-chevron-down" class="spionage-gradient"
                        v-if="availableNavigationPolicies?.find(e => e.policy === 'Government_Navigation')">
        <template v-slot:header>
          <q-item-section avatar>
            <q-icon name="mdi-incognito"/>
          </q-item-section>
          <q-item-section @click="espionageClicks++">
            Kontrollabteilung
            <q-tooltip v-if="espionageClicks === 69">
              Was? Niemand will Gewerbe ausspionieren!
            </q-tooltip>
          </q-item-section>
        </template>
          <q-item clickable v-ripple :to="`/government/employee-list`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Government_UserList_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-account-details"/>
            </q-item-section>
            <q-item-section>Mitarbeiterübersicht</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/government/balance-view`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Government_BalanceView_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-scale-balance"/>
              </q-item-section>
              <q-item-section>Bilanz Übersicht</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/government/transaction-list`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Government_TransactionList_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-format-list-bulleted"/>
              </q-item-section>
              <q-item-section>Transaktions Liste</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/government/payment-list`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Government_PaymentList_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-cash-multiple"/>
              </q-item-section>
              <q-item-section>Zahlungs Liste</q-item-section>
          </q-item>
        <q-item clickable v-ripple :to="`/government/vehicles-list`"
                v-if="availableNavigationPolicies?.find(e => e.policy === 'Government_CompanyVehicles_Navigation')">
          <q-item-section avatar>
            <q-icon name="mdi-car"/>
          </q-item-section>
          <q-item-section>Firmenfahrzeuge</q-item-section>
        </q-item>
      </q-expansion-item>
      <q-expansion-item label="Produktverwaltung" expand-icon="mdi-chevron-down" icon="mdi-cart"
                        v-if="availableNavigationPolicies?.find(e => e.policy === 'ProductManagement_Navigation') && companyId > 0">
          <q-item clickable v-ripple :to="`/product-management/products/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'ProductManagement_Articles_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-silverware"/>
              </q-item-section>
              <q-item-section>Artikelübersicht</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/product-management/menus/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'ProductManagement_Menus_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-food"/>
              </q-item-section>
              <q-item-section>Menüs/Bundles</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/product-management/types/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'ProductManagement_ArticleTypes_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-cube"/>
              </q-item-section>
              <q-item-section>Artikeltypen</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/product-management/categories/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'ProductManagement_ArticleCategories_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-shape"/>
              </q-item-section>
              <q-item-section>Artikelkategorien</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/product-management/stock/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'ProductManagement_ArticleStock_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-format-list-group"/>
              </q-item-section>
              <q-item-section>Artikelbestände</q-item-section>
          </q-item>
      </q-expansion-item>
      <q-expansion-item label="Allgemeine Verwaltung" expand-icon="mdi-chevron-down" icon="mdi-cog"
                        v-if="availableNavigationPolicies?.find(e => e.policy === 'GeneralManagement_Navigation') && companyId > 0">
          <q-item clickable v-ripple :to="`/general-management/discount/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'GeneralManagement_Discounts_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-percent-box"/>
              </q-item-section>
              <q-item-section>Rabatte</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/general-management/accounting/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'GeneralManagement_Accounting_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-bank"/>
              </q-item-section>
              <q-item-section>Buchhaltung</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/general-management/company-settings/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'GeneralManagement_CompanySettings_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-office-building-cog"/>
              </q-item-section>
              <q-item-section>Firmen Einstellungen</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/general-management/company-panel/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'GeneralManagement_CompanyPanel_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-view-agenda"/>
              </q-item-section>
              <q-item-section>Firmen Panel</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/general-management/news-board/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'GeneralManagement_NewsBoard_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-developer-board"/>
              </q-item-section>
              <q-item-section>News Board</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/general-management/company-cars/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'GeneralManagement_CompanyCars_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-car-multiple"/>
              </q-item-section>
              <q-item-section>Firmenfahrzeuge</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/general-management/company-applicant-settings/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'GeneralManagement_ApplicantsAdditionalFields_Navigation')">
              <q-item-section avatar>
                  <q-icon name="mdi-table-account"/>
              </q-item-section>
              <q-item-section>Bewerber Zusatzfelder</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/general-management/external-access/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'GeneralManagement_ExternalAccess_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-account-tie-hat"/>
            </q-item-section>
            <q-item-section>Zugriffsanfragen</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/general-management/radio-settings/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'GeneralManagement_Radio_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-radio-tower"/>
            </q-item-section>
            <q-item-section>Funkfrequenzen</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/general-management/taxmax-car-status/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'GeneralManagement_Taxmax_CarStatus_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-car-search-outline"/>
            </q-item-section>
            <q-item-section>TaxMax® Fahrzeug Status</q-item-section>
          </q-item>
      </q-expansion-item>
      <q-expansion-item label="Dokumenten Dinge" expand-icon="mdi-chevron-down" icon="mdi-file-cabinet"
                        v-if="availableNavigationPolicies?.find(e => e.policy === 'Document_Management_Navigation') && companyId > 0">
        <q-item clickable v-ripple :to="`/documents/types/${ companyId }`"
                v-if="availableNavigationPolicies?.find(e => e.policy === 'Document_Management_Types_Navigation')">
          <q-item-section avatar>
            <q-icon name="mdi-file-outline"/>
          </q-item-section>
          <q-item-section>Dokumenten Typen</q-item-section>
        </q-item>
        <q-item clickable v-ripple :to="`/documents/classifications/${ companyId }`"
                v-if="availableNavigationPolicies?.find(e => e.policy === 'Document_Management_Classification_Navigation')">
          <q-item-section avatar>
            <q-icon name="mdi-file-arrow-up-down-outline"/>
          </q-item-section>
          <q-item-section>Dokumenten Klassifizierungen</q-item-section>
        </q-item>
        <q-item clickable v-ripple :to="`/documents/templates/${ companyId }`"
                v-if="availableNavigationPolicies?.find(e => e.policy === 'Document_Management_Classification_Navigation')">
          <q-item-section avatar>
            <q-icon name="mdi-file-code-outline"/>
          </q-item-section>
          <q-item-section>Dokumenten Vorlagen</q-item-section>
        </q-item>
      </q-expansion-item>
      <q-expansion-item label="Bilanz Übersicht" expand-icon="mdi-chevron-down" icon="mdi-chart-pie"
                        v-if="availableNavigationPolicies?.find(e => e.policy === 'BalanceView_Navigation') && companyId > 0">
          <q-item clickable v-ripple :to="`/balance/all-employees/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'BalanceView_All_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-chart-timeline"/>
            </q-item-section>
              <q-item-section>Alle Mitarbeiter/innen</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/balance/self/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'BalanceView_Self_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-chart-timeline"/>
            </q-item-section>
              <q-item-section>Eigene</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/balance/fancy-graphs/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'BalanceView_FancyGraphs_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-chart-areaspline"/>
            </q-item-section>
              <q-item-section>Fancy Graphen</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/balance/payment/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'BalanceView_PayOut_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-cash-multiple"/>
            </q-item-section>
              <q-item-section>Auszahlungen</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/balance/employee-statistics/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'BalanceView_UserStatistics_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-chart-line"/>
            </q-item-section>
              <q-item-section>Mitarbeiter Statistiken</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/balance/company-balance/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'BalanceView_CompanyBalance_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-abacus"/>
            </q-item-section>
              <q-item-section>Firmen Bilanz</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/balance/company-statistics/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'BalanceView_CompanyStatistics_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-chart-donut-variant"/>
            </q-item-section>
              <q-item-section>Firmen Statistiken</q-item-section>
          </q-item>
      </q-expansion-item>
      <q-expansion-item label="Statistiken" expand-icon="mdi-chevron-down" icon="mdi-chart-tree"
                        v-if="availableNavigationPolicies?.find(e => e.policy === 'Statistics_Navigation') && companyId > 0">
        <q-item clickable v-ripple :to="`/statistics/products/${ companyId }`"
                v-if="availableNavigationPolicies?.find(e => e.policy === 'Statistics_Products_Navigation') && companyId > 0">
          <q-item-section avatar>
            <q-icon name="mdi-poll"/>
          </q-item-section>
          <q-item-section>
            Produkt Statistiken
          </q-item-section>
        </q-item>
      </q-expansion-item>
      <q-expansion-item label="Verträge" expand-icon="mdi-chevron-down" icon="mdi-clipboard-text"
                        v-if="availableNavigationPolicies?.find(e => e.policy === 'Contracts_Navigation') && companyId > 0">
          <q-item clickable v-ripple :to="`/contract/contracts/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Contracts_ContractList_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-clipboard-text-multiple-outline"/>
            </q-item-section>
              <q-item-section>Vertragsübersicht</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/contract/booking/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Contracts_Booking_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-book-open-variant"/>
            </q-item-section>
              <q-item-section>Buchungen</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/contract/billing/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Contracts_Billing_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-credit-card"/>
            </q-item-section>
              <q-item-section>Abrechnen</q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="`/contract/b2b/${ companyId }`"
                  v-if="availableNavigationPolicies?.find(e => e.policy === 'Contracts_B2B_Navigation')">
            <q-item-section avatar>
              <q-icon name="mdi-domain"/>
            </q-item-section>
            <q-item-section>B2B Verträge</q-item-section>
          </q-item>
      </q-expansion-item>
      <q-expansion-item label="Rennverwaltung" expand-icon="mdi-chevron-down" icon="mdi-car-sports"
                        v-if="availableNavigationPolicies?.find(e => e.policy === 'RaceManagement_Navigation') && companyId > 0">
        <q-item clickable v-ripple :to="`/race/management/${ companyId }`"
                v-if="availableNavigationPolicies?.find(e => e.policy === 'RaceManagement_Race_Navigation')">
          <q-item-section avatar>
            <q-icon name="mdi-flag-checkered"/>
          </q-item-section>
          <q-item-section>Rennliste</q-item-section>
        </q-item>
        <q-item clickable v-ripple :to="`/race/racelocker/${ companyId }`" v-if="availableNavigationPolicies?.find(e => e.policy === 'RaceManagement_Racelocker_Navigation') && companyId > 0">
          <q-item-section avatar>
            <q-icon name="mdi-timer-outline"/>
          </q-item-section>
          <q-item-section>Racelocker</q-item-section>
        </q-item>
      </q-expansion-item>
      <q-item clickable v-ripple :to="`/transaction-history/${ companyId }`"
              v-if="availableNavigationPolicies?.find(e => e.policy === 'TransactionHistory_Navigation') && companyId > 0">
        <q-item-section avatar>
          <q-icon name="mdi-history"/>
        </q-item-section>
          <q-item-section>Transaktions Historie</q-item-section>
      </q-item>
      <q-item clickable v-ripple :to="`/shopping-list/${ companyId }`"
              v-if="availableNavigationPolicies?.find(e => e.policy === 'Shopping_List_Navigation') && companyId > 0">
        <q-item-section avatar>
          <q-icon name="mdi-cart-arrow-down"/>
        </q-item-section>
          <q-item-section>Einkaufsliste</q-item-section>
      </q-item>
      <q-expansion-item label="Nicht gelistete Produkte" expand-icon="mdi-chevron-down" icon="mdi-clipboard-text"
                        v-if="availableNavigationPolicies?.find(e => e.policy === 'NonProductPolicy_Navigation') && companyId > 0">
        <q-item clickable v-ripple :to="`/custom-products/refuel/${ companyId }`"
                v-if="availableNavigationPolicies?.find(e => e.policy === 'NonProductPolicy_Refuel_Navigation') && companyId > 0">
          <q-item-section avatar>
            <q-icon name="mdi-gas-station-outline"/>
          </q-item-section>
          <q-item-section>Tanken</q-item-section>
        </q-item>
        <q-item clickable v-ripple :to="`/custom-products/customs/${ companyId }`"
                v-if="availableNavigationPolicies?.find(e => e.policy === 'NonProductPolicy_Customs_Navigation') && companyId > 0">
          <q-item-section avatar>
            <q-icon name="mdi-calculator-variant-outline"/>
          </q-item-section>
          <q-item-section>Benutzerdefinierte Erfassungen</q-item-section>
        </q-item>
      </q-expansion-item>
      <q-item clickable v-ripple :to="`/cash-register/${ companyId }`"
              v-if="availableNavigationPolicies?.find(e => e.policy === 'CashRegister_Navigation') && companyId > 0">
        <q-item-section avatar>
          <q-icon name="mdi-basket"/>
        </q-item-section>
          <q-item-section>Kasse</q-item-section>
      </q-item>
      <q-item clickable v-ripple :to="`/taxmax/${ companyId }`"
              v-if="availableNavigationPolicies?.find(e => e.policy === 'TaxMax_Navigation') && companyId > 0">
        <q-item-section avatar>
          <q-icon name="mdi-taxi"/>
        </q-item-section>
        <q-item-section>TaxMax®</q-item-section>
      </q-item>
  </q-list>
  <div v-else-if="availableNavigationPolicies === undefined && !companiesAvailable && !loadingPolicies">
    <div class="col items-center justify-center q-mt-sm">
      <div class="row justify-center q-mb-sm">
        <div class="text-bold">
          Ein Gewerbe auswählen um mehr zu sehen
        </div>
      </div>
    </div>
  </div>
  <div v-else class="full-width">
    <div class="col items-center justify-center q-mt-sm">
      <div class="row justify-center q-mb-sm" v-for="n in 2" :key="n">
        <q-skeleton type="rect" width="92%"/>
      </div>
      <div class="row justify-center q-mb-sm" v-for="n in 10" :key="n">
        <q-skeleton class="col-1 q-mr-sm" type="circle" height="25px" width="25px"/>
        <q-skeleton class="col-10" type="rect" width="80%"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import { api } from 'boot/axios'
import { ICompanyPanel } from 'src/misc/interfaces/CompanyPanel/ICompanyPanel'
import laravelEcho from 'src/boot/laravelecho'
import IRace from 'src/misc/interfaces/Race/IRace'
import { useUserStore } from 'stores/useUserStore'

export default defineComponent({
  name: 'NavigationComponent',
  setup () {
    const companyStateStore = companyStore()
    const companyId = computed(() => companyStateStore.companyId)
    const userStore = useUserStore()
    const companiesAvailable = computed(() => userStore.companiesAvailable)
    const availableNavigationPolicies = ref<{ policy: string}[] | undefined>([])
    const companyPanels = ref<ICompanyPanel[]>()
    const availableRaces = ref<IRace[] | undefined>(undefined)
    const espionageClicks = ref<number>(0)
    const loadingPolicies = ref<boolean>(false)
    onMounted(() => {
      getAvailableNavigationPermissions()
      getAvailableGeneralNavigationPermissions()
      getAvailableCompanyPanels()
      listenToChangedPanels()
      getAvailableRaces()
    })
    watch(() => companyId.value, () => {
      availableNavigationPolicies.value = undefined
      getAvailableNavigationPermissions()
      getAvailableGeneralNavigationPermissions()
      getAvailableCompanyPanels()
      unsubscribeChangedPanels()
      listenToChangedPanels()
    })
    function getAvailableNavigationPermissions () {
      if (companyId.value <= 0) return
      loadingPolicies.value = true
      api.get('/api/companyNavigation/' + companyId.value)
        .then((response) => {
          if (availableNavigationPolicies.value === undefined) availableNavigationPolicies.value = []
          availableNavigationPolicies.value?.push(...response.data.navigationPolicies)
          loadingPolicies.value = false
        })
        .catch((error) => {
          loadingPolicies.value = false
          console.error(error)
        })
    }
    function getAvailableGeneralNavigationPermissions () {
      api.get('/api/user/generalNavigation')
        .then((response) => {
          if (availableNavigationPolicies.value === undefined) availableNavigationPolicies.value = []
          availableNavigationPolicies.value?.push(...response.data)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getAvailableCompanyPanels () {
      if (companyId.value <= 0) return
      api.get('/api/companyPanels/reducedForShowing/' + companyId.value)
        .then((response) => {
          companyPanels.value = response.data.companyPanels
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function listenToChangedPanels () {
      if (companyId.value <= 0) return
      // listen to the company panel changed event
      laravelEcho.join('general.companyPanelChanged.' + companyId.value)
        .listen('.company.companyPanel.changed', () => {
          getAvailableCompanyPanels()
        })
    }
    function unsubscribeChangedPanels () {
      if (companyId.value <= 0) return
      laravelEcho.leave('general.companyPanelChanged.' + companyId.value)
      laravelEcho.leave('general.companyLogoChanged.' + companyId.value)
    }
    function updateNavigationOnRankUpdate () {
      getAvailableCompanyPanels()
      unsubscribeChangedPanels()
      listenToChangedPanels()
    }
    function getAvailableRaces () {
      api.get('/api/publicRace/available')
        .then((res) => {
          availableRaces.value = res.data
        })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      companyStateStore,
      companyId,
      availableNavigationPolicies,
      companyPanels,
      updateNavigationOnRankUpdate,
      availableRaces,
      espionageClicks,
      companiesAvailable,
      loadingPolicies
    }
  },
  expose: ['updateNavigationOnRankUpdate']
})
</script>

<style scoped>
a:hover {
  color: #9C5A96;
  text-decoration: none;
}
.attention-seeker-racelocker {
  background: linear-gradient(90deg, #EE791A, #99E22C);
  -webkit-animation: leuteAbfucken 0s ease infinite;
  -moz-animation: leuteAbfucken 0s ease infinite;
  animation: leuteAbfucken 0s ease infinite;
  -o-animation: leuteAbfucken 0s ease infinite;
  color: black !important;
}
@-webkit-keyframes leuteAbfucken {
  0%{background-position:54% 0%}
  50%{background-position:47% 100%}
  100%{background-position:54% 0%}
}
@-moz-keyframes leuteAbfucken {
  0%{background-position:54% 0%}
  50%{background-position:47% 100%}
  100%{background-position:54% 0%}
}
@-o-keyframes leuteAbfucken {
  0%{background-position:54% 0%}
  50%{background-position:47% 100%}
  100%{background-position:54% 0%}
}
@keyframes leuteAbfucken {
  0%{background-position:54% 0%}
  50%{background-position:47% 100%}
  100%{background-position:54% 0%}
}
.custom-race-locker-shadow:hover {
  -webkit-animation: raceLockerTextAnim 0.75s forwards;
  -moz-animation: raceLockerTextAnim 0.75s forwards;
  animation: raceLockerTextAnim 0.75s forwards;
  -o-animation: raceLockerTextAnim 0.75s forwards;
}
@keyframes raceLockerTextAnim {
  0%{text-shadow: 0 0 0 black;}
  25%{text-shadow: 3px 2px 3px black;}
  50%{text-shadow: 3px 2px 6px black;}
  75%{text-shadow: 3px 2px 9px black;}
  100%{text-shadow: 3px 2px 11px black;}
}
</style>
