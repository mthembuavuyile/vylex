import { $, $$ } from './utils.js';

export const DOMElements = {
  // User info displays
  welcomeMessage: $('#welcome-message'),
  userNameDisplay: $('#user-name-display'), userEmailDisplay: $('#user-email-display'), userAvatarDisplay: $('#user-avatar-display'),
  userAvatarButton: $('#user-avatar-button'), dropdownUserName: $('#dropdown-user-name'), dropdownUserEmail: $('#dropdown-user-email'),
  
  // Layout & Navigation
  sidebar: $('#sidebar'), overlay: $('#overlay'), userDropdownMenu: $('#user-dropdown-menu'),
  
  // Modals & Forms
  clientModal: $('#client-modal'), clientForm: $('#client-form'), clientFormError: $('#client-form-error'), saveClientButton: $('#save-client-button'),
  confirmationModal: $('#confirmation-modal'), confirmationTitle: $('#confirmation-title'), confirmationMessage: $('#confirmation-message'), confirmationConfirmBtn: $('#confirmation-confirm-btn'),
  
  // Tables
  clientsTableBody: $('#clients-table-body'), clientsTableContainer: $('#clients-table-container'),
  casesTableBody: $('#cases-table-body'), casesTableContainer: $('#cases-table-container'),
  
  // Profile Page
  profileForm: $('#profile-form'), profileNameInput: $('#profile-name'), profileEmailInput: $('#profile-email'),
  saveProfileButton: $('#save-profile-button'), profileFormFeedback: $('#profile-form-feedback'),
  
  // Documents
  addDocumentButton: $('#add-document-button'),
  documentsTableBody: $('#documents-table-body'), documentsTableContainer: $('#documents-table-container'),
  documentsFilterCase: $('#documents-filter-case'), documentsSearch: $('#documents-search'),
  documentModal: $('#document-modal'), documentForm: $('#document-form'), documentFormError: $('#document-form-error'),
  documentCaseSelect: $('#document-case-select'), documentFileInput: $('#document-file-input'),
  saveDocumentButton: $('#save-document-button'), documentUploadProgress: $('#document-upload-progress'),
  
  // Case Edit Page
  caseEditForm: $('#case-edit-form'), caseEditError: $('#case-edit-error'), saveCaseButton: $('#case-edit-save'),
  caseEditDescription: $('#case-edit-description'), caseEditPreview: $('#case-edit-preview'),
  caseEditPreviewLength: $('#case-edit-preview-length'),
  
  // Calendar
  addEventButton: $('#add-event-button'),
  eventModal: $('#event-modal'), eventForm: $('#event-form'), eventFormError: $('#event-form-error'), saveEventButton: $('#save-event-button'),
  calendarMonth: $('#calendar-month'), calendarGrid: $('#calendar-grid'),
  calendarPrev: $('#calendar-prev'), calendarNext: $('#calendar-next'),
  upcomingEventsList: $('#upcoming-events-list'),
  
  // Settings
  billingSettingsForm: $('#billing-settings-form'),
  defaultHourlyRate: $('#default-hourly-rate'),
  saveBillingSettings: $('#save-billing-settings'),
  billingSettingsFeedback: $('#billing-settings-feedback')
};
