export const translations = {
  en: {
    // Auth & Account
    login: 'Manager Login',
    signup: 'Create Account',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    signin: 'Sign In',
    signupButton: 'Sign Up',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    passwordsMustMatch: 'Passwords must match',
    accountCreated: 'Account created successfully! Please login.',
    logout: 'Logout',
    
    // Dashboard & Navigation
    dashboard: 'Event Dashboard',
    createEvent: 'Create Event',
    analytics: 'Analytics',
    noEvents: 'No events yet',
    back: 'Back',
    viewRegistrationPage: 'View Registration Page',
    
    // Event Management
    eventTitle: 'Event Title',
    date: 'Date',
    location: 'Location',
    description: 'Description',
    eventDetails: 'Event Details',
    
    // Groups & Stakeholders
    addGroup: 'Add Stakeholder Group',
    groupName: 'Group Name',
    capacity: 'Capacity',
    stakeholderGroups: 'Stakeholder Groups',
    groups: 'groups',
    addStakeholderPrompt: 'Start by adding a stakeholder group (e.g., Attendees, Speakers, Sponsors)',
    
    // Form Builder
    addField: 'Add Field',
    fieldLabel: 'Field Label',
    fieldType: 'Field Type',
    formFields: 'Form Fields',
    noFieldsYet: 'No fields added yet. Click "Add Field" to start.',
    required: 'Required',
    yes: 'Yes',
    no: 'No',
    selectOptions: 'Select Options',
    option: 'Option',
    preview: 'Preview',
    untitled: '(Untitled)',
    
    // Field Types
    text: 'Text',
    number: 'Number',
    select: 'Select',
    file: 'File',
    
    // Actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    submit: 'Submit',
    add: 'Add',
    
    // Registration
    selectRole: 'Select Your Role',
    register: 'Register',
    registerAs: 'Register as: ',
    selectThisCategory: 'Select This Category',
    fieldsRequired: 'fields required',
    
    // Status & Messages
    success: 'Success!',
    qrSent: 'QR code sent to email',
    registrationSuccess: 'You have been registered successfully! Check your email for your QR code.',
    saveCodeForCheckin: 'Save this code for check-in',
    registerAnother: 'Register Another Person',
    
    // Analytics
    registrations: 'Registrations',
    checkedIn: 'Checked In',
    totalRegistrations: 'Total Registrations',
    utilizationRate: 'Utilization Rate',
    remainingSpots: 'Remaining Spots',
    checkInRate: 'check-in rate',
    ofAvailableCapacity: 'of available capacity',
    availableForRegistration: 'available for registration',
    registrationsByGroup: 'Registrations by Group',
    checkInStatus: 'Check-in Status',
    detailedStatistics: 'Detailed Statistics',
    group: 'Group',
    available: 'Available',
    rate: 'Rate',
    pending: 'Pending',
    total: 'Total',
    ofCapacity: 'of capacity',
    
    // QR & Check-in
    scanQR: 'Scan QR Code',
    verifyAttendee: 'Verify Attendee',
    checkIn: 'Check-in',
    enterQRCode: 'Enter QR Code',
    manualEntry: 'Manual Entry',
    camera: 'Camera',
    soon: 'Soon',
    verifying: 'Verifying...',
    checkInSuccessful: 'Check-in Successful!',
    alreadyCheckedIn: 'Already checked in',
    invalidQRCode: 'Invalid QR code',
    time: 'Time: ',
    previouslyCheckedInAt: 'Previously checked in at: ',
    instructions: 'Instructions',
    instruction1: 'Use a barcode scanner to scan the QR code from the attendee card',
    instruction2: 'The code will be automatically entered and verified',
    instruction3: 'Or enter the code manually and click the verify button',
    
    // Placeholders
    placeholderEventTitle: 'Oman Tech Exhibition',
    placeholderLocation: 'Muscat, Oman',
    placeholderDescription: 'Event description...',
    placeholderGroupName: 'Group Name (e.g., Attendees)',
    placeholderFieldLabel: 'e.g., Full Name',
    placeholderQRCode: 'QR Code...',
    selectPlaceholder: 'Select...',
    sampleInput: 'Sample input',
    enterField: 'Enter',
    
    // Validation & Errors
    fillAllRequired: 'Please fill all required fields',
    addAtLeastOneGroup: 'Please add at least one stakeholder group',
    nameAllGroups: 'Please name all groups',
    addFieldsToGroup: 'Please add fields to group',
    fieldRequired: 'is required',
    capacityReached: 'Sorry, this category has reached its capacity',
    
    // Loading States
    loading: 'Loading...',
    creating: 'Creating...',
    submitting: 'Submitting...',
    
    // Misc
    clickToUpload: 'Click to upload file',
    cameraModeUnderDevelopment: 'Camera mode is under development',
    useManualEntry: 'Please use manual entry for now',
    scanWithBarcode: 'Scan with a barcode scanner or enter manually',
    noDataAvailable: 'No data available',
    noCategoriesAvailable: 'No categories available for registration',
    chooseAppropriateCategory: 'Choose the appropriate category to register for the event',
    
    // Confirmations
    confirmDelete: 'Are you sure you want to delete this event?',
    
    // Time & Date
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  },
  
  ar: {
    // Auth & Account
    login: 'تسجيل دخول المدير',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    name: 'الاسم الكامل',
    signin: 'تسجيل الدخول',
    signupButton: 'التسجيل',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    passwordsMustMatch: 'يجب أن تتطابق كلمات المرور',
    accountCreated: 'تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.',
    logout: 'تسجيل خروج',
    
    // Dashboard & Navigation
    dashboard: 'لوحة الفعاليات',
    createEvent: 'إنشاء فعالية',
    analytics: 'التحليلات',
    noEvents: 'لا توجد فعاليات',
    back: 'رجوع',
    viewRegistrationPage: 'عرض صفحة التسجيل',
    
    // Event Management
    eventTitle: 'عنوان الفعالية',
    date: 'التاريخ',
    location: 'الموقع',
    description: 'الوصف',
    eventDetails: 'تفاصيل الفعالية',
    
    // Groups & Stakeholders
    addGroup: 'إضافة مجموعة',
    groupName: 'اسم المجموعة',
    capacity: 'السعة',
    stakeholderGroups: 'مجموعات أصحاب المصلحة',
    groups: 'مجموعات',
    addStakeholderPrompt: 'ابدأ بإضافة مجموعة أصحاب مصلحة (مثل: حضور، متحدثون، رعاة)',
    
    // Form Builder
    addField: 'إضافة حقل',
    fieldLabel: 'تسمية الحقل',
    fieldType: 'نوع الحقل',
    formFields: 'حقول النموذج',
    noFieldsYet: 'لم يتم إضافة حقول بعد. انقر على "إضافة حقل" للبدء.',
    required: 'مطلوب',
    yes: 'نعم',
    no: 'لا',
    selectOptions: 'خيارات القائمة',
    option: 'خيار',
    preview: 'معاينة',
    untitled: '(بلا عنوان)',
    
    // Field Types
    text: 'نص',
    number: 'رقم',
    select: 'اختيار',
    file: 'ملف',
    
    // Actions
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    submit: 'إرسال',
    add: 'إضافة',
    
    // Registration
    selectRole: 'اختر دورك',
    register: 'تسجيل',
    registerAs: 'التسجيل كـ: ',
    selectThisCategory: 'اختيار هذه الفئة',
    fieldsRequired: 'حقل مطلوب',
    
    // Status & Messages
    success: 'نجح!',
    qrSent: 'تم إرسال رمز QR إلى البريد',
    registrationSuccess: 'تم تسجيلك بنجاح! تحقق من بريدك الإلكتروني للحصول على رمز QR.',
    saveCodeForCheckin: 'احفظ هذا الرمز لتسجيل الدخول',
    registerAnother: 'تسجيل شخص آخر',
    
    // Analytics
    registrations: 'التسجيلات',
    checkedIn: 'حضور مسجل',
    totalRegistrations: 'إجمالي التسجيلات',
    utilizationRate: 'معدل الاستخدام',
    remainingSpots: 'الأماكن المتبقية',
    checkInRate: 'معدل الحضور',
    ofAvailableCapacity: 'من السعة المتاحة',
    availableForRegistration: 'متاح للتسجيل',
    registrationsByGroup: 'التسجيلات حسب المجموعة',
    checkInStatus: 'حالة تسجيل الدخول',
    detailedStatistics: 'إحصائيات تفصيلية',
    group: 'المجموعة',
    available: 'متاح',
    rate: 'النسبة',
    pending: 'قيد الانتظار',
    total: 'المجموع',
    ofCapacity: 'من السعة',
    
    // QR & Check-in
    scanQR: 'مسح رمز QR',
    verifyAttendee: 'التحقق من الحضور',
    checkIn: 'تسجيل الدخول',
    enterQRCode: 'أدخل رمز QR',
    manualEntry: 'إدخال يدوي',
    camera: 'كاميرا',
    soon: 'قريباً',
    verifying: 'جاري التحقق...',
    checkInSuccessful: 'تم التسجيل بنجاح!',
    alreadyCheckedIn: 'تم تسجيل الدخول مسبقاً',
    invalidQRCode: 'رمز QR غير صالح',
    time: 'التوقيت: ',
    previouslyCheckedInAt: 'تم التسجيل في: ',
    instructions: 'تعليمات',
    instruction1: 'استخدم ماسح الباركود لمسح رمز QR من بطاقة الحضور',
    instruction2: 'سيتم إدخال الرمز تلقائياً والتحقق منه',
    instruction3: 'أو أدخل الرمز يدوياً واضغط على زر التحقق',
    
    // Placeholders
    placeholderEventTitle: 'معرض عُمان التقني',
    placeholderLocation: 'مسقط، عُمان',
    placeholderDescription: 'وصف الفعالية...',
    placeholderGroupName: 'اسم المجموعة (مثل: الحضور)',
    placeholderFieldLabel: 'مثال: الاسم الكامل',
    placeholderQRCode: 'رمز QR...',
    selectPlaceholder: 'اختر...',
    sampleInput: 'مثال على الإدخال',
    enterField: 'أدخل',
    
    // Validation & Errors
    fillAllRequired: 'يرجى ملء جميع الحقول المطلوبة',
    addAtLeastOneGroup: 'يرجى إضافة مجموعة واحدة على الأقل',
    nameAllGroups: 'يرجى تسمية جميع المجموعات',
    addFieldsToGroup: 'يرجى إضافة حقول للمجموعة',
    fieldRequired: 'مطلوب',
    capacityReached: 'عذراً، تم الوصول للسعة القصوى لهذه الفئة',
    
    // Loading States
    loading: 'جاري التحميل...',
    creating: 'جاري الإنشاء...',
    submitting: 'جاري الإرسال...',
    
    // Misc
    clickToUpload: 'انقر لتحميل الملف',
    cameraModeUnderDevelopment: 'وضع الكاميرا قيد التطوير',
    useManualEntry: 'استخدم الإدخال اليدوي في الوقت الحالي',
    scanWithBarcode: 'امسح الرمز باستخدام ماسح الباركود أو أدخله يدوياً',
    noDataAvailable: 'لا توجد بيانات',
    noCategoriesAvailable: 'لا توجد فئات متاحة للتسجيل',
    chooseAppropriateCategory: 'اختر الفئة المناسبة للتسجيل في الفعالية',
    
    // Confirmations
    confirmDelete: 'هل أنت متأكد من حذف هذه الفعالية؟',
    
    // Time & Date (for date formatting)
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
};