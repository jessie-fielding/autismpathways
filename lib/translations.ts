/**
 * Autism Pathways — Phase 1 Translations
 *
 * Usage: const { t } = useLanguage();
 *        t('English text', 'Texto en español')
 *
 * This file documents all translated strings for reference.
 * Translations use natural Latin American Spanish with a warm,
 * parent-to-parent tone — not literal word-for-word translation.
 *
 * Phase 1 covers: navigation, buttons, headers, and all hub screens.
 * Phase 2 will cover deep content (quiz questions, scripts, checklists).
 */

export const T = {
  // ── Global navigation & common UI ──────────────────────────────────────────
  back: { en: '← Back', es: '← Atrás' },
  backToDashboard: { en: '← Dashboard', es: '← Inicio' },
  next: { en: 'Next', es: 'Siguiente' },
  done: { en: 'Done', es: 'Listo' },
  save: { en: 'Save', es: 'Guardar' },
  cancel: { en: 'Cancel', es: 'Cancelar' },
  delete: { en: 'Delete', es: 'Eliminar' },
  edit: { en: 'Edit', es: 'Editar' },
  add: { en: 'Add', es: 'Agregar' },
  close: { en: 'Close', es: 'Cerrar' },
  yes: { en: 'Yes', es: 'Sí' },
  no: { en: 'No', es: 'No' },
  ok: { en: 'OK', es: 'Aceptar' },
  loading: { en: 'Loading...', es: 'Cargando...' },
  error: { en: 'Something went wrong. Please try again.', es: 'Algo salió mal. Por favor intenta de nuevo.' },
  premiumFeature: { en: '⭐ Premium Feature', es: '⭐ Función Premium' },
  unlockPremium: { en: 'Unlock with Premium →', es: 'Desbloquear con Premium →' },
  comingSoon: { en: 'Feature coming soon', es: 'Próximamente' },
  learnMore: { en: 'Learn More', es: 'Saber más' },
  viewAll: { en: 'View All', es: 'Ver todo' },
  getStarted: { en: 'Get Started', es: 'Comenzar' },
  continueBtn: { en: 'Continue', es: 'Continuar' },
  shareAnonymously: { en: 'Share Anonymously', es: 'Compartir de forma anónima' },
  shareAsMe: { en: 'Share as Me', es: 'Compartir como yo' },

  // ── Tab bar ────────────────────────────────────────────────────────────────
  tabHome: { en: 'Home', es: 'Inicio' },
  tabDiagnosis: { en: 'Diagnosis', es: 'Diagnóstico' },
  tabMedicaid: { en: 'Medicaid', es: 'Medicaid' },
  tabTools: { en: 'Tools', es: 'Herramientas' },
  tabSettings: { en: 'Settings', es: 'Ajustes' },

  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboardGreeting: { en: "You've got this.", es: 'Tú puedes con esto.' },
  dashboardSubtitle: { en: 'The guide your child\'s diagnosis didn\'t come with.', es: 'La guía que no vino con el diagnóstico de tu hijo.' },
  dashboardPathways: { en: 'PATHWAYS', es: 'CAMINOS' },
  dashboardQuickTools: { en: 'QUICK TOOLS', es: 'HERRAMIENTAS RÁPIDAS' },
  dashboardSisterApp: { en: 'Also from Autism Pathways', es: 'También de Autism Pathways' },

  // Pathway cards
  pathwayDiagnosis: { en: 'Diagnosis', es: 'Diagnóstico' },
  pathwayIEP: { en: 'IEP & School', es: 'IEP y Escuela' },
  pathwayMedicaid: { en: 'Medicaid', es: 'Medicaid' },
  pathwayWaiver: { en: 'Waivers', es: 'Programas de Asistencia' },
  pathwayTransition: { en: 'Plan Ahead', es: 'Planifica el Futuro' },
  pathwayPotty: { en: 'Potty Training', es: 'Entrenamiento de Baño' },

  // Quick tool labels
  toolObservations: { en: 'Observations', es: 'Observaciones' },
  toolTalkingPoints: { en: 'Talking Points', es: 'Puntos de Conversación' },
  toolContacts: { en: 'Contacts', es: 'Contactos' },
  toolDocuments: { en: 'Documents', es: 'Documentos' },
  toolSafeSpace: { en: 'Safe Space', es: 'Espacio Seguro' },
  toolReminders: { en: 'Reminders', es: 'Recordatorios' },
  toolAppeals: { en: 'Appeals', es: 'Apelaciones' },
  toolServices: { en: 'Services', es: 'Servicios' },
  toolProviders: { en: 'Providers', es: 'Proveedores' },

  // ── Onboarding / Start Here ────────────────────────────────────────────────
  onboardingWelcome: { en: 'Welcome to Autism Pathways', es: 'Bienvenida a Autism Pathways' },
  onboardingTagline: { en: "The guide your child's diagnosis didn't come with.", es: 'La guía que no vino con el diagnóstico de tu hijo.' },
  onboardingChildName: { en: "What's your child's name?", es: '¿Cómo se llama tu hijo/a?' },
  onboardingChildAge: { en: "How old is your child?", es: '¿Cuántos años tiene tu hijo/a?' },
  onboardingState: { en: 'What state are you in?', es: '¿En qué estado vives?' },
  onboardingStateSubtitle: { en: 'We use this to personalize your Medicaid and waiver information.', es: 'Usamos esto para personalizar tu información de Medicaid y programas de asistencia.' },
  onboardingDiagnosis: { en: "What's your child's diagnosis?", es: '¿Cuál es el diagnóstico de tu hijo/a?' },
  onboardingContinue: { en: 'Continue →', es: 'Continuar →' },
  onboardingSkip: { en: 'Skip for now', es: 'Omitir por ahora' },
  onboardingAlreadyHaveAccount: { en: 'Already have an account?', es: '¿Ya tienes una cuenta?' },
  onboardingSignIn: { en: 'Sign In', es: 'Iniciar sesión' },

  // ── Sign In / Create Account ───────────────────────────────────────────────
  signInTitle: { en: 'Sign In', es: 'Iniciar sesión' },
  signInEmail: { en: 'Email address', es: 'Correo electrónico' },
  signInPassword: { en: 'Password', es: 'Contraseña' },
  signInButton: { en: 'Sign In', es: 'Iniciar sesión' },
  signInForgot: { en: 'Forgot password?', es: '¿Olvidaste tu contraseña?' },
  signInNoAccount: { en: "Don't have an account?", es: '¿No tienes cuenta?' },
  signInCreate: { en: 'Create Account', es: 'Crear cuenta' },
  createAccountTitle: { en: 'Create Account', es: 'Crear cuenta' },
  createAccountButton: { en: 'Create Account', es: 'Crear cuenta' },
  createAccountHaveOne: { en: 'Already have an account?', es: '¿Ya tienes una cuenta?' },

  // ── IEP Hub ────────────────────────────────────────────────────────────────
  iepTitle: { en: 'IEP & School', es: 'IEP y Escuela' },
  iepSubtitle: { en: 'Your child has rights. We help you use them.', es: 'Tu hijo/a tiene derechos. Te ayudamos a usarlos.' },
  iepWhatIs: { en: 'What is an IEP?', es: '¿Qué es un IEP?' },
  iepWhatIsDesc: { en: 'An Individualized Education Program is a legal document that outlines the special education services your child will receive.', es: 'Un Programa de Educación Individualizada es un documento legal que describe los servicios de educación especial que recibirá tu hijo/a.' },
  iepMeetingPrep: { en: 'Meeting Prep', es: 'Preparación para la reunión' },
  iepGoalTracker: { en: 'Goal Tracker', es: 'Seguimiento de metas' },
  iepDistrictLookup: { en: 'Find Your District', es: 'Encuentra tu distrito' },
  iepEvaluatorLookup: { en: 'Find an Evaluator', es: 'Encuentra un evaluador' },
  iepTalkingPoints: { en: 'Talking Points', es: 'Puntos de conversación' },
  iepRights: { en: 'Your Rights', es: 'Tus derechos' },
  iepTimeline: { en: 'IEP Timeline', es: 'Cronograma del IEP' },

  // ── Waiver Hub ─────────────────────────────────────────────────────────────
  waiverTitle: { en: 'Waivers & Funding', es: 'Programas de Asistencia y Financiamiento' },
  waiverSubtitle: { en: 'Home and community-based services your child may qualify for.', es: 'Servicios en el hogar y la comunidad para los que tu hijo/a puede calificar.' },
  waiverWhatIs: { en: 'What is a Waiver?', es: '¿Qué es un programa de asistencia?' },
  waiverWhatIsDesc: { en: 'Medicaid waivers (also called HCBS waivers) pay for services that help your child live at home and in the community instead of in a facility.', es: 'Los programas de asistencia de Medicaid pagan por servicios que ayudan a tu hijo/a a vivir en casa y en la comunidad en lugar de en una institución.' },
  waiverApply: { en: 'Apply for a Waiver', es: 'Solicitar un programa de asistencia' },
  waiverTracker: { en: 'Waitlist Tracker', es: 'Seguimiento de lista de espera' },
  waiverStateOverview: { en: 'Your State\'s Waiver', es: 'El programa de tu estado' },
  waiverServices: { en: 'Waiver Services', es: 'Servicios del programa' },
  waiverUtilization: { en: 'Use Your Waiver', es: 'Aprovecha tu programa' },
  waiverABAQuiz: { en: 'Is ABA Right for My Child?', es: '¿Es ABA adecuado para mi hijo/a?' },

  // ── Medicaid Hub ───────────────────────────────────────────────────────────
  medicaidTitle: { en: 'Medicaid', es: 'Medicaid' },
  medicaidSubtitle: { en: 'Step-by-step help applying for and keeping Medicaid.', es: 'Ayuda paso a paso para solicitar y mantener Medicaid.' },
  medicaidYourSituation: { en: 'What\'s your situation?', es: '¿Cuál es tu situación?' },
  medicaidNotApplied: { en: 'I haven\'t applied yet', es: 'Todavía no he solicitado' },
  medicaidApplied: { en: 'I applied and I\'m waiting', es: 'Solicité y estoy esperando' },
  medicaidApproved: { en: 'I\'m approved', es: 'Ya tengo aprobación' },
  medicaidDenied: { en: 'I was denied', es: 'Me negaron la solicitud' },
  medicaidHowToApply: { en: 'How to Apply', es: 'Cómo solicitar' },
  medicaidAppeal: { en: 'Appeal a Denial', es: 'Apelar una negación' },
  medicaidSelectState: { en: 'Select Your State', es: 'Selecciona tu estado' },

  // ── Transition Hub ─────────────────────────────────────────────────────────
  transitionTitle: { en: 'Plan Ahead & Transition', es: 'Planifica el Futuro' },
  transitionSubtitle: { en: 'Adult services have 10+ year waitlists. Start planning now.', es: 'Los servicios para adultos tienen listas de espera de más de 10 años. Empieza a planificar ahora.' },
  transitionUrgentBanner: { en: '⚠️ If your child is under 13, apply for adult services NOW', es: '⚠️ Si tu hijo/a tiene menos de 13 años, solicita servicios para adultos AHORA' },
  transitionStage0: { en: 'Under 13 — Get on the List', es: 'Menos de 13 años — Inscríbete en la lista' },
  transitionStage1: { en: 'Ages 14-15 — Start the Conversation', es: '14-15 años — Inicia la conversación' },
  transitionStage2: { en: 'Ages 16-17 — Build the Plan', es: '16-17 años — Construye el plan' },
  transitionStage3: { en: 'Age 18 — Senior Year', es: '18 años — El año decisivo' },
  transitionStage4: { en: 'Ages 18-22 — Navigating the Gap', es: '18-22 años — Navegando el vacío' },
  transitionStage5: { en: 'Age 22+ — Adult Life', es: '22+ años — La vida adulta' },
  transitionStateWaivers: { en: '50-State Adult Waiver Lookup', es: 'Búsqueda de programas para adultos en los 50 estados' },

  // ── Tools Tab ──────────────────────────────────────────────────────────────
  toolsTitle: { en: 'Tools', es: 'Herramientas' },
  toolsSubtitle: { en: 'Everything you need in one place.', es: 'Todo lo que necesitas en un solo lugar.' },
  toolsObservations: { en: 'Observations', es: 'Observaciones' },
  toolsObservationsDesc: { en: 'Track behaviors and patterns to share with providers.', es: 'Registra comportamientos y patrones para compartir con los proveedores.' },
  toolsTalkingPoints: { en: 'Talking Points', es: 'Puntos de conversación' },
  toolsTalkingPointsDesc: { en: 'Scripts for IEP meetings, doctor visits, and more.', es: 'Guiones para reuniones de IEP, visitas al médico y más.' },
  toolsContacts: { en: 'Contact List', es: 'Lista de contactos' },
  toolsContactsDesc: { en: 'All your child\'s providers in one place.', es: 'Todos los proveedores de tu hijo/a en un solo lugar.' },
  toolsDocuments: { en: 'Document Vault', es: 'Bóveda de documentos' },
  toolsDocumentsDesc: { en: 'Store and organize important documents.', es: 'Guarda y organiza documentos importantes.' },
  toolsSafeSpace: { en: 'Safe Space', es: 'Espacio Seguro' },
  toolsSafeSpaceDesc: { en: 'A private journal for your thoughts and feelings.', es: 'Un diario privado para tus pensamientos y sentimientos.' },
  toolsAppeals: { en: 'Appeal Tracker', es: 'Seguimiento de apelaciones' },
  toolsAppealsDesc: { en: 'Track insurance denials and deadlines.', es: 'Registra negaciones de seguro y fechas límite.' },
  toolsServices: { en: 'Services Tracker', es: 'Seguimiento de servicios' },
  toolsServicesDesc: { en: 'Track your child\'s therapy schedule.', es: 'Registra el horario de terapias de tu hijo/a.' },
  toolsProviders: { en: 'Provider Directory', es: 'Directorio de proveedores' },
  toolsProvidersDesc: { en: 'Find autism-friendly providers near you.', es: 'Encuentra proveedores especializados cerca de ti.' },
  toolsReminders: { en: 'Reminders', es: 'Recordatorios' },
  toolsRemindersDesc: { en: 'Set reminders for appointments and deadlines.', es: 'Configura recordatorios para citas y fechas límite.' },

  // ── Safe Space / Community ─────────────────────────────────────────────────
  safeSpaceTitle: { en: 'Safe Space', es: 'Espacio Seguro' },
  safeSpaceSubtitle: { en: 'This is your space. Write freely.', es: 'Este es tu espacio. Escribe libremente.' },
  safeSpaceNewEntry: { en: '+ New Entry', es: '+ Nueva entrada' },
  safeSpaceCommunity: { en: 'Community', es: 'Comunidad' },
  safeSpacePrivate: { en: 'Private', es: 'Privado' },
  safeSpaceSharePrompt: { en: 'Share this entry with the community?', es: '¿Compartir esta entrada con la comunidad?' },
  communityTitle: { en: 'Community', es: 'Comunidad' },
  communitySubtitle: { en: 'You\'re not alone. Read what other parents are sharing.', es: 'No estás sola. Lee lo que otras familias están compartiendo.' },
  communityReport: { en: 'Report', es: 'Reportar' },
  communityReply: { en: 'Reply', es: 'Responder' },
  communityLike: { en: 'Like', es: 'Me gusta' },
  communityAnonymous: { en: 'Anonymous', es: 'Anónimo/a' },

  // ── Settings ───────────────────────────────────────────────────────────────
  settingsTitle: { en: 'Settings', es: 'Ajustes' },
  settingsAccount: { en: 'ACCOUNT', es: 'CUENTA' },
  settingsNotifications: { en: 'NOTIFICATIONS', es: 'NOTIFICACIONES' },
  settingsLanguage: { en: 'LANGUAGE', es: 'IDIOMA' },
  settingsLanguageLabel: { en: 'App Language', es: 'Idioma de la aplicación' },
  settingsLanguageDesc: { en: 'Switch between English and Spanish', es: 'Cambiar entre inglés y español' },
  settingsJourney: { en: 'YOUR JOURNEY', es: 'TU CAMINO' },
  settingsPrivacy: { en: 'PRIVACY & DATA', es: 'PRIVACIDAD Y DATOS' },
  settingsAbout: { en: 'ABOUT', es: 'ACERCA DE' },
  settingsActiveChild: { en: 'Active Child', es: 'Hijo/a activo/a' },
  settingsManageChildren: { en: 'Manage Children', es: 'Administrar hijos' },
  settingsManageChildrenDesc: { en: 'Add, switch, or edit child profiles', es: 'Agregar, cambiar o editar perfiles de hijos' },
  settingsYourState: { en: 'Your State', es: 'Tu estado' },
  settingsSignOut: { en: 'Sign Out', es: 'Cerrar sesión' },
  settingsSignOutDesc: { en: 'You can sign back in anytime', es: 'Puedes volver a iniciar sesión cuando quieras' },
  settingsPremiumActive: { en: 'Premium Active', es: 'Premium Activo' },
  settingsPremiumActiveDesc: { en: 'Thank you for supporting Autism Pathways. You have access to all features.', es: 'Gracias por apoyar Autism Pathways. Tienes acceso a todas las funciones.' },
  settingsPremiumUnlock: { en: 'Upgrade to Premium', es: 'Actualizar a Premium' },
  settingsPremiumUnlockDesc: { en: 'Unlock the Appeal Tracker, unlimited contacts, all talking point scripts, and more.', es: 'Desbloquea el seguimiento de apelaciones, contactos ilimitados, todos los guiones y más.' },
  settingsManageSub: { en: 'Manage Subscription', es: 'Administrar suscripción' },
  settingsMedicaidPathway: { en: 'Medicaid Pathway', es: 'Camino de Medicaid' },
  settingsWaiverChecklist: { en: 'Waiver Checklist', es: 'Lista de verificación del programa' },
  settingsDisabilityQuiz: { en: 'Disability Quiz', es: 'Cuestionario de discapacidad' },
  settingsResetJourney: { en: 'Reset Journey Progress', es: 'Reiniciar progreso del camino' },
  settingsResetJourneyDesc: { en: 'Start your pathway over from the beginning', es: 'Empieza tu camino desde el principio' },
  settingsPrivacyPolicy: { en: 'Privacy Policy', es: 'Política de privacidad' },
  settingsPrivacyPolicyDesc: { en: 'How we protect your data', es: 'Cómo protegemos tus datos' },
  settingsTerms: { en: 'Terms of Service', es: 'Términos de servicio' },
  settingsTermsDesc: { en: 'Our terms and conditions', es: 'Nuestros términos y condiciones' },
  settingsAnonymize: { en: 'Anonymize My Data', es: 'Anonimizar mis datos' },
  settingsAnonymizeDesc: { en: 'Replace identifying info with anonymous placeholders', es: 'Reemplazar información de identificación con datos anónimos' },
  settingsDeleteData: { en: 'Delete My Data', es: 'Eliminar mis datos' },
  settingsDeleteDataDesc: { en: 'Permanently remove all your data', es: 'Eliminar permanentemente todos tus datos' },
  settingsSources: { en: 'Sources & Citations', es: 'Fuentes y citas' },
  settingsSourcesDesc: { en: 'All sources used in this app', es: 'Todas las fuentes utilizadas en esta aplicación' },
  settingsBlog: { en: 'Blog & Resources', es: 'Blog y recursos' },
  settingsContact: { en: 'Contact Support', es: 'Contactar soporte' },
  settingsRate: { en: 'Rate the App', es: 'Calificar la aplicación' },
  settingsRateDesc: { en: 'Help other families find us', es: 'Ayuda a otras familias a encontrarnos' },
  settingsVersion: { en: 'Autism Pathways v1.0.4', es: 'Autism Pathways v1.0.4' },
  settingsCopyright: { en: '© 2026 Autism Pathways LLC', es: '© 2026 Autism Pathways LLC' },

  // ── Paywall ────────────────────────────────────────────────────────────────
  paywallTitle: { en: 'Unlock Premium', es: 'Desbloquear Premium' },
  paywallSubtitle: { en: 'Everything your family needs, all in one place.', es: 'Todo lo que tu familia necesita, en un solo lugar.' },
  paywallMonthly: { en: 'Monthly', es: 'Mensual' },
  paywallAnnual: { en: 'Annual', es: 'Anual' },
  paywallBestValue: { en: 'Best Value', es: 'Mejor precio' },
  paywallSubscribe: { en: 'Subscribe Now', es: 'Suscribirse ahora' },
  paywallRestore: { en: 'Restore Purchases', es: 'Restaurar compras' },
  paywallTerms: { en: 'Terms', es: 'Términos' },
  paywallPrivacy: { en: 'Privacy', es: 'Privacidad' },

  // ── Diagnosis Pathway ──────────────────────────────────────────────────────
  diagnosisTitle: { en: 'Diagnosis Pathway', es: 'Camino del diagnóstico' },
  diagnosisSubtitle: { en: 'Getting a diagnosis is the first step. We\'ll walk you through it.', es: 'Obtener un diagnóstico es el primer paso. Te acompañamos en el proceso.' },
  diagnosisWhy: { en: 'Why Get a Diagnosis?', es: '¿Por qué obtener un diagnóstico?' },
  diagnosisEvalType: { en: 'Types of Evaluations', es: 'Tipos de evaluaciones' },
  diagnosisHelpDecide: { en: 'Help Me Decide', es: 'Ayúdame a decidir' },
  diagnosisFindEvaluator: { en: 'Find an Evaluator', es: 'Encontrar un evaluador' },
  diagnosisAppointment: { en: 'My Appointment', es: 'Mi cita' },
  diagnosisHowDidItGo: { en: 'How Did It Go?', es: '¿Cómo resultó?' },

  // ── Potty Training Hub ─────────────────────────────────────────────────────
  pottyTitle: { en: 'Potty Training', es: 'Entrenamiento de baño' },
  pottySubtitle: { en: 'Sensory-informed strategies for autistic children.', es: 'Estrategias informadas por sensorialidad para niños autistas.' },
  pottyQuiz: { en: 'Readiness Quiz', es: 'Cuestionario de preparación' },
  pottyTools: { en: 'Tools & Strategies', es: 'Herramientas y estrategias' },
  pottyBowelDiary: { en: 'Bowel Diary', es: 'Diario intestinal' },
  pottySensoryAudit: { en: 'Sensory Audit', es: 'Auditoría sensorial' },
  pottyVisualSchedule: { en: 'Visual Schedule', es: 'Horario visual' },
  pottyProviderReport: { en: 'Provider Report', es: 'Informe para el proveedor' },

  // ── Observations ──────────────────────────────────────────────────────────
  observationsTitle: { en: 'Observations', es: 'Observaciones' },
  observationsSubtitle: { en: 'Track what you notice. Bring patterns to your next appointment.', es: 'Registra lo que observas. Lleva los patrones a tu próxima cita.' },
  observationsNewEntry: { en: '+ New Observation', es: '+ Nueva observación' },
  observationsEmpty: { en: 'No observations yet. Tap + to add your first one.', es: 'Aún no hay observaciones. Toca + para agregar la primera.' },

  // ── Provider Prep ──────────────────────────────────────────────────────────
  providerPrepTitle: { en: 'Provider Prep', es: 'Preparación para el proveedor' },
  providerPrepSubtitle: { en: 'Walk into every appointment ready.', es: 'Llega a cada cita preparada.' },
  providerPrepStart: { en: 'Start Prep', es: 'Comenzar preparación' },

  // ── Provider Report ────────────────────────────────────────────────────────
  providerReportTitle: { en: 'Provider Report', es: 'Informe para el proveedor' },
  providerReportSubtitle: { en: 'Generate a summary to share with your child\'s team.', es: 'Genera un resumen para compartir con el equipo de tu hijo/a.' },
  providerReportGenerate: { en: 'Generate Report', es: 'Generar informe' },

  // ── Talking Points ─────────────────────────────────────────────────────────
  talkingPointsTitle: { en: 'Talking Points', es: 'Puntos de conversación' },
  talkingPointsSubtitle: { en: 'Scripts for every conversation that matters.', es: 'Guiones para cada conversación importante.' },
  talkingPointsIEP: { en: 'IEP Meeting', es: 'Reunión de IEP' },
  talkingPointsDoctor: { en: 'Doctor Visit', es: 'Visita al médico' },
  talkingPointsSchool: { en: 'School Communication', es: 'Comunicación con la escuela' },
  talkingPointsInsurance: { en: 'Insurance Call', es: 'Llamada al seguro' },
  talkingPointsTherapist: { en: 'Therapist Check-in', es: 'Revisión con el terapeuta' },

  // ── In-progress translation notice ────────────────────────────────────────
  translationInProgress: {
    en: 'Full English content available.',
    es: 'Traducción completa al español próximamente. El contenido está disponible en inglés.',
  },
} as const;

export type TranslationKey = keyof typeof T;
