export type EvaluatorType = 'inperson' | 'telehealth' | 'both';

export type Evaluator = {
  id: string;
  state: string;
  name: string;
  detail: string;
  type: EvaluatorType;
  tags: string[];
  phone: string | null;
  url: string | null;
};

export const EVALUATORS: Evaluator[] = [
  /* ── Alabama ── */
  { id: 'al_uab', state: 'AL', name: 'UAB Civitan-Sparks Clinics', detail: 'Birmingham, AL. University-based comprehensive autism evaluations for children and adults.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '205-934-5471', url: 'https://www.uab.edu/civitan' },
  { id: 'al_telehealth', state: 'AL', name: 'Autism Evaluation Services — Telehealth AL', detail: 'Alabama-licensed telehealth provider. ADOS-2 assessments via video for rural families.', type: 'telehealth', tags: ['Telehealth', 'AL-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Alaska ── */
  { id: 'ak_anmc', state: 'AK', name: 'Alaska Native Medical Center — Developmental Pediatrics', detail: 'Anchorage, AK. Primary developmental evaluation center for Alaska families. Accepts Medicaid.', type: 'inperson', tags: ['All ages', 'Medicaid-accepted', 'Hospital-based'], phone: '907-563-2662', url: 'https://www.anthc.org' },
  { id: 'ak_telehealth', state: 'AK', name: 'Nationwide Children\'s — Telehealth for Alaska', detail: 'Ohio-based, AK-licensed telehealth. Serves remote Alaska communities with limited local access.', type: 'telehealth', tags: ['Telehealth', 'Remote-friendly', 'ADOS-2', 'Ages 2+'], phone: '614-722-2000', url: 'https://www.nationwidechildrens.org' },

  /* ── Arizona ── */
  { id: 'az_pcw', state: 'AZ', name: 'Phoenix Children\'s — Developmental & Behavioral Pediatrics', detail: 'Phoenix, AZ. Comprehensive autism evaluations with multidisciplinary teams.', type: 'inperson', tags: ['All ages', 'Multidisciplinary', 'ADOS-2', 'School-accepted'], phone: '602-933-0920', url: 'https://www.phoenixchildrens.org' },
  { id: 'az_uofa', state: 'AZ', name: 'University of Arizona — SARRC', detail: 'Phoenix, AZ. Southwest Autism Research & Resource Center. Evaluations and early intervention.', type: 'inperson', tags: ['All ages', 'Research-backed', 'Early intervention', 'School-accepted'], phone: '602-340-8717', url: 'https://www.autismcenter.org' },
  { id: 'az_telehealth', state: 'AZ', name: 'AZ Telehealth Autism Diagnostics', detail: 'Arizona-licensed telehealth. ADOS-2 and CARS-2 via video. Shorter waits than hospital centers.', type: 'telehealth', tags: ['Telehealth', 'Fast scheduling', 'ADOS-2', 'Ages 2+'], phone: null, url: null },

  /* ── Arkansas ── */
  { id: 'ar_uams', state: 'AR', name: 'UAMS Arkansas Children\'s Hospital — Developmental Pediatrics', detail: 'Little Rock, AR. State\'s primary children\'s hospital with autism diagnostic services.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '501-364-1100', url: 'https://www.archildrens.org' },
  { id: 'ar_telehealth', state: 'AR', name: 'AR Telehealth Autism Services', detail: 'Arkansas-licensed telehealth. Serving rural AR families who face long drives to Little Rock.', type: 'telehealth', tags: ['Telehealth', 'Rural-friendly', 'AR-licensed', 'Ages 2+'], phone: null, url: null },

  /* ── California ── */
  { id: 'ca_chla', state: 'CA', name: 'Children\'s Hospital LA — Developmental-Behavioral Pediatrics', detail: 'Los Angeles, CA. One of the nation\'s top children\'s hospitals with comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'Nationally ranked', 'ADOS-2', 'School-accepted'], phone: '323-361-2153', url: 'https://www.chla.org' },
  { id: 'ca_ucsf', state: 'CA', name: 'UCSF Child & Adolescent Psychiatry — Autism Program', detail: 'San Francisco, CA. University-based program with research-backed evaluation protocols.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '415-476-7000', url: 'https://www.ucsf.edu' },
  { id: 'ca_stanford', state: 'CA', name: 'Stanford Children\'s — Autism and Developmental Medicine', detail: 'Palo Alto, CA. World-class evaluation center. Longer waits but highly comprehensive.', type: 'inperson', tags: ['All ages', 'World-class', 'ADOS-2', 'ADI-R', 'School-accepted'], phone: '650-723-5070', url: 'https://www.stanfordchildrens.org' },
  { id: 'ca_telehealth', state: 'CA', name: 'Cortica — Telehealth Autism Diagnostics', detail: 'California-based telehealth. Fast scheduling, ADOS-2 certified evaluators, reports accepted statewide.', type: 'telehealth', tags: ['Telehealth', 'Fast scheduling', 'ADOS-2', 'CA-statewide'], phone: '844-426-7842', url: 'https://www.corticacare.com' },

  /* ── Colorado ── */
  { id: 'co_childrens', state: 'CO', name: 'Children\'s Hospital Colorado — Autism & Developmental Medicine', detail: 'Aurora, CO. Comprehensive autism evaluations for children of all ages by a multidisciplinary team.', type: 'inperson', tags: ['All ages', 'Multidisciplinary', 'ADOS-2', 'School-accepted'], phone: '720-777-6200', url: 'https://www.childrenscolorado.org/doctors-and-departments/departments/developmental-pediatrics/' },
  { id: 'co_jfk', state: 'CO', name: 'JFK Partners — University of Colorado', detail: 'Aurora, CO. University-affiliated center specializing in developmental disabilities and autism evaluations.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'DD evaluations', 'School-accepted'], phone: '303-724-7727', url: 'https://medschool.cuanschutz.edu/jfk-partners' },
  { id: 'co_spark', state: 'CO', name: 'Spark Pediatric Neuropsychology', detail: 'Denver, CO. Boutique neuropsychology practice with shorter wait times. Telehealth and in-person options.', type: 'both', tags: ['Ages 2+', 'Neuropsychology', 'Telehealth available'], phone: null, url: null },
  { id: 'co_telehealth_reach', state: 'CO', name: 'REACH Telehealth — Autism Diagnostic Services', detail: 'Colorado-licensed telehealth provider. ADOS-2 and CARS-2 assessments delivered via video. Fast scheduling.', type: 'telehealth', tags: ['Telehealth only', 'Fast scheduling', 'ADOS-2', 'Ages 2+'], phone: null, url: null },

  /* ── Connecticut ── */
  { id: 'ct_yale', state: 'CT', name: 'Yale Child Study Center — Autism Program', detail: 'New Haven, CT. World-renowned autism research and evaluation center.', type: 'inperson', tags: ['All ages', 'World-class', 'ADOS-2', 'ADI-R', 'School-accepted'], phone: '203-785-2540', url: 'https://childstudycenter.yale.edu' },
  { id: 'ct_ccmc', state: 'CT', name: 'Connecticut Children\'s — Developmental & Behavioral Pediatrics', detail: 'Hartford, CT. Statewide children\'s hospital with comprehensive autism evaluation services.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '860-837-5680', url: 'https://www.connecticutchildrens.org' },
  { id: 'ct_telehealth', state: 'CT', name: 'CT Telehealth Autism Evaluations', detail: 'Connecticut-licensed telehealth. Fast scheduling for families on long hospital waitlists.', type: 'telehealth', tags: ['Telehealth', 'Fast scheduling', 'CT-licensed', 'Ages 2+'], phone: null, url: null },

  /* ── Delaware ── */
  { id: 'de_ai_dupont', state: 'DE', name: 'AI duPont Hospital — Autism Evaluation Program', detail: 'Wilmington, DE. The primary hospital-based autism evaluation program in Delaware. Accepts most major insurances.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'Insurance-friendly', 'School-accepted'], phone: '302-651-4000', url: 'https://www.nemours.org/services/autism.html' },
  { id: 'de_map', state: 'DE', name: 'Developmental Pediatrics at MAP Health', detail: 'Newark, DE. Community-based developmental pediatrics with autism diagnostic services and shorter typical wait times.', type: 'inperson', tags: ['Newark DE', 'Shorter waits', 'Ages 18mo+'], phone: null, url: null },
  { id: 'de_telehealth_total', state: 'DE', name: 'Total Spectrum Care — Telehealth Diagnostics', detail: 'Delaware-licensed telehealth. Serving rural DE families who face long drives to Wilmington.', type: 'telehealth', tags: ['Telehealth', 'DE-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Florida ── */
  { id: 'fl_usf', state: 'FL', name: 'USF Autism & Neurodevelopmental Disabilities Program', detail: 'Tampa, FL. University-based program with comprehensive evaluations and research-backed protocols.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'School-accepted', 'ADOS-2'], phone: '813-974-2733', url: 'https://hscweb3.hsc.usf.edu/health/publichealth/autism/' },
  { id: 'fl_nicklaus', state: 'FL', name: 'Nicklaus Children\'s Hospital — Autism Center', detail: 'Miami, FL. Full diagnostic evaluations including psychology, speech, and OT components.', type: 'inperson', tags: ['All ages', 'Multidisciplinary', 'Spanish-speaking staff', 'School-accepted'], phone: '786-624-2111', url: 'https://www.nicklauschildrens.org/centers-and-programs/autism-center' },
  { id: 'fl_orlando', state: 'FL', name: 'Florida Autism Center — Orlando', detail: 'Orlando, FL. Diagnostic and early intervention services. Telehealth intake with in-person evaluation.', type: 'both', tags: ['Central FL', 'Telehealth intake', 'Ages 18mo+'], phone: null, url: null },
  { id: 'fl_telehealth', state: 'FL', name: 'FL Telehealth Autism Diagnostics', detail: 'Florida-licensed telehealth. ADOS-2 evaluations accepted by FL school districts and Medicaid.', type: 'telehealth', tags: ['Telehealth', 'FL-statewide', 'ADOS-2', 'School-accepted'], phone: null, url: null },

  /* ── Georgia ── */
  { id: 'ga_marcus', state: 'GA', name: 'Marcus Autism Center', detail: 'Atlanta, GA. One of the largest autism centers in the US. Comprehensive evaluations with relatively short wait times.', type: 'inperson', tags: ['All ages', 'Nationally ranked', 'ADOS-2', 'ADI-R', 'School-accepted'], phone: '404-785-9400', url: 'https://www.marcus.org' },
  { id: 'ga_choa', state: 'GA', name: 'Children\'s Healthcare of Atlanta — Autism Center', detail: 'Atlanta, GA. Hospital-based evaluations with multidisciplinary teams. Multiple metro Atlanta locations.', type: 'inperson', tags: ['All ages', 'Multidisciplinary', 'ADOS-2', 'School-accepted'], phone: '404-785-5437', url: 'https://www.choa.org' },
  { id: 'ga_telehealth', state: 'GA', name: 'GA Telehealth Autism Services', detail: 'Georgia-licensed telehealth. Serving rural GA families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'GA-licensed', 'Fast scheduling', 'Ages 2+'], phone: null, url: null },

  /* ── Hawaii ── */
  { id: 'hi_kapiolani', state: 'HI', name: 'Kapiolani Medical Center — Developmental Pediatrics', detail: 'Honolulu, HI. Hawaii\'s primary children\'s hospital with autism diagnostic services.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '808-983-6000', url: 'https://www.kapiolani.org' },
  { id: 'hi_telehealth', state: 'HI', name: 'Pacific Telehealth Autism Diagnostics', detail: 'Hawaii-licensed telehealth. Serving neighbor island families who cannot travel to Oahu.', type: 'telehealth', tags: ['Telehealth', 'HI-licensed', 'Neighbor islands', 'Ages 2+'], phone: null, url: null },

  /* ── Idaho ── */
  { id: 'id_slch', state: 'ID', name: 'St. Luke\'s Children\'s — Developmental Pediatrics', detail: 'Boise, ID. Primary developmental evaluation center for Idaho families.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '208-381-2222', url: 'https://www.stlukesonline.org' },
  { id: 'id_telehealth', state: 'ID', name: 'ID Telehealth Autism Evaluations', detail: 'Idaho-licensed telehealth. Serving rural Idaho families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'ID-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Illinois ── */
  { id: 'il_lurie', state: 'IL', name: 'Lurie Children\'s Hospital — Developmental-Behavioral Pediatrics', detail: 'Chicago, IL. One of the nation\'s top children\'s hospitals. Comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'Nationally ranked', 'ADOS-2', 'School-accepted'], phone: '312-227-4000', url: 'https://www.luriechildrens.org' },
  { id: 'il_uchicago', state: 'IL', name: 'UChicago Medicine — Developmental Pediatrics', detail: 'Chicago, IL. University-based evaluations with research-backed protocols.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '773-702-6808', url: 'https://www.uchicagomedicine.org' },
  { id: 'il_telehealth', state: 'IL', name: 'IL Telehealth Autism Diagnostics', detail: 'Illinois-licensed telehealth. Fast scheduling for families on long Chicago hospital waitlists.', type: 'telehealth', tags: ['Telehealth', 'IL-statewide', 'Fast scheduling', 'ADOS-2'], phone: null, url: null },

  /* ── Indiana ── */
  { id: 'in_riley', state: 'IN', name: 'Riley Children\'s Health — Developmental Pediatrics', detail: 'Indianapolis, IN. Indiana\'s flagship children\'s hospital with comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '317-944-5000', url: 'https://www.rileychildrens.org' },
  { id: 'in_telehealth', state: 'IN', name: 'IN Telehealth Autism Services', detail: 'Indiana-licensed telehealth. Serving rural IN families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'IN-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Iowa ── */
  { id: 'ia_uiowa', state: 'IA', name: 'University of Iowa Stead Family Children\'s Hospital', detail: 'Iowa City, IA. University-based comprehensive developmental and autism evaluations.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '319-356-2229', url: 'https://uichildrens.org' },
  { id: 'ia_telehealth', state: 'IA', name: 'IA Telehealth Autism Evaluations', detail: 'Iowa-licensed telehealth. Serving rural Iowa families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'IA-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Kansas ── */
  { id: 'ks_ku', state: 'KS', name: 'KU Medical Center — Developmental Pediatrics', detail: 'Kansas City, KS. University-based autism evaluations with comprehensive multidisciplinary teams.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '913-588-6300', url: 'https://www.kumc.edu' },
  { id: 'ks_telehealth', state: 'KS', name: 'KS Telehealth Autism Diagnostics', detail: 'Kansas-licensed telehealth. Serving rural KS families who face long drives to Kansas City.', type: 'telehealth', tags: ['Telehealth', 'KS-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Kentucky ── */
  { id: 'ky_norton', state: 'KY', name: 'Norton Children\'s — Developmental Pediatrics', detail: 'Louisville, KY. Comprehensive autism evaluations at Kentucky\'s leading children\'s hospital.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '502-629-8000', url: 'https://nortonchildrens.com' },
  { id: 'ky_telehealth', state: 'KY', name: 'KY Telehealth Autism Services', detail: 'Kentucky-licensed telehealth. Serving Appalachian KY families with limited local access.', type: 'telehealth', tags: ['Telehealth', 'KY-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Louisiana ── */
  { id: 'la_tulane', state: 'LA', name: 'Tulane University — Autism & Developmental Medicine', detail: 'New Orleans, LA. University-based comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '504-988-5601', url: 'https://www.tulane.edu' },
  { id: 'la_telehealth', state: 'LA', name: 'LA Telehealth Autism Diagnostics', detail: 'Louisiana-licensed telehealth. Serving rural LA families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'LA-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Maine ── */
  { id: 'me_mmc', state: 'ME', name: 'Maine Medical Center — Developmental Pediatrics', detail: 'Portland, ME. Maine\'s primary developmental evaluation center. Accepts MaineCare.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'MaineCare-accepted', 'School-accepted'], phone: '207-662-0111', url: 'https://www.mainehealth.org' },
  { id: 'me_telehealth', state: 'ME', name: 'ME Telehealth Autism Evaluations', detail: 'Maine-licensed telehealth. Serving rural Maine families who face long drives to Portland.', type: 'telehealth', tags: ['Telehealth', 'ME-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Maryland ── */
  { id: 'md_kennedy_krieger', state: 'MD', name: 'Kennedy Krieger Institute — Center for Autism', detail: 'Baltimore, MD. Nationally recognized autism diagnostic and treatment center. Comprehensive evaluations.', type: 'both', tags: ['All ages', 'Nationally ranked', 'ADOS-2', 'ADI-R', 'Telehealth available', 'School-accepted'], phone: '443-923-9400', url: 'https://www.kennedykrieger.org' },
  { id: 'md_jhopkins', state: 'MD', name: 'Johns Hopkins — Developmental Medicine', detail: 'Baltimore, MD. World-class evaluation center affiliated with Johns Hopkins Medicine.', type: 'inperson', tags: ['All ages', 'World-class', 'ADOS-2', 'School-accepted'], phone: '410-955-5000', url: 'https://www.hopkinsmedicine.org' },

  /* ── Massachusetts ── */
  { id: 'ma_lurie', state: 'MA', name: 'Lurie Center for Autism — Mass General', detail: 'Lexington, MA. One of the nation\'s leading autism evaluation and research centers.', type: 'inperson', tags: ['All ages', 'Nationally ranked', 'ADOS-2', 'ADI-R', 'School-accepted'], phone: '781-860-1700', url: 'https://www.massgeneral.org/lurie-center' },
  { id: 'ma_boston_childrens', state: 'MA', name: 'Boston Children\'s Hospital — Autism Program', detail: 'Boston, MA. World-renowned children\'s hospital with comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'World-class', 'ADOS-2', 'School-accepted'], phone: '617-355-6000', url: 'https://www.childrenshospital.org' },
  { id: 'ma_telehealth', state: 'MA', name: 'MA Telehealth Autism Diagnostics', detail: 'Massachusetts-licensed telehealth. Fast scheduling for families on long Boston hospital waitlists.', type: 'telehealth', tags: ['Telehealth', 'MA-licensed', 'Fast scheduling', 'ADOS-2'], phone: null, url: null },

  /* ── Michigan ── */
  { id: 'mi_umich', state: 'MI', name: 'University of Michigan — Autism & Communication Disorders Center', detail: 'Ann Arbor, MI. University-based comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '734-936-8000', url: 'https://www.med.umich.edu' },
  { id: 'mi_spectrum', state: 'MI', name: 'Spectrum Health — Developmental Pediatrics', detail: 'Grand Rapids, MI. West Michigan\'s leading developmental evaluation center.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '616-391-9000', url: 'https://www.spectrumhealth.org' },
  { id: 'mi_telehealth', state: 'MI', name: 'MI Telehealth Autism Services', detail: 'Michigan-licensed telehealth. Serving rural UP and northern MI families.', type: 'telehealth', tags: ['Telehealth', 'MI-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Minnesota ── */
  { id: 'mn_mayo', state: 'MN', name: 'Mayo Clinic — Developmental & Behavioral Pediatrics', detail: 'Rochester, MN. World-class evaluation at Mayo Clinic. Comprehensive multidisciplinary assessments.', type: 'inperson', tags: ['All ages', 'World-class', 'ADOS-2', 'ADI-R', 'School-accepted'], phone: '507-284-2511', url: 'https://www.mayoclinic.org' },
  { id: 'mn_childrens', state: 'MN', name: 'Children\'s Minnesota — Developmental Pediatrics', detail: 'Minneapolis, MN. Comprehensive autism evaluations at Minnesota\'s leading children\'s hospital.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '612-813-6000', url: 'https://www.childrensmn.org' },
  { id: 'mn_telehealth', state: 'MN', name: 'MN Telehealth Autism Evaluations', detail: 'Minnesota-licensed telehealth. Serving rural MN families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'MN-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Mississippi ── */
  { id: 'ms_ummc', state: 'MS', name: 'UMMC Children\'s of Mississippi — Developmental Pediatrics', detail: 'Jackson, MS. Mississippi\'s primary children\'s hospital with autism diagnostic services.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '601-984-1000', url: 'https://www.umc.edu/som/Departments%20and%20Offices/SOM%20Departments/Pediatrics/Divisions/Developmental-Behavioral-Pediatrics' },
  { id: 'ms_telehealth', state: 'MS', name: 'MS Telehealth Autism Diagnostics', detail: 'Mississippi-licensed telehealth. Serving rural MS families with limited local access.', type: 'telehealth', tags: ['Telehealth', 'MS-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Missouri ── */
  { id: 'mo_stlouis', state: 'MO', name: 'St. Louis Children\'s Hospital — Developmental Pediatrics', detail: 'St. Louis, MO. Washington University-affiliated children\'s hospital with comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '314-454-6000', url: 'https://www.stlouischildrens.org' },
  { id: 'mo_childrens_mercy', state: 'MO', name: 'Children\'s Mercy — Developmental & Behavioral Health', detail: 'Kansas City, MO. Comprehensive autism evaluations at the region\'s leading children\'s hospital.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '816-234-3000', url: 'https://www.childrensmercy.org' },
  { id: 'mo_telehealth', state: 'MO', name: 'MO Telehealth Autism Services', detail: 'Missouri-licensed telehealth. Serving rural MO families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'MO-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Montana ── */
  { id: 'mt_shodair', state: 'MT', name: 'Shodair Children\'s Hospital — Developmental Services', detail: 'Helena, MT. Montana\'s primary children\'s hospital with developmental evaluation services.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'School-accepted'], phone: '406-444-7500', url: 'https://www.shodair.org' },
  { id: 'mt_telehealth', state: 'MT', name: 'MT Telehealth Autism Evaluations', detail: 'Montana-licensed telehealth. Serving rural MT families across the state\'s vast geography.', type: 'telehealth', tags: ['Telehealth', 'MT-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Nebraska ── */
  { id: 'ne_munroe_meyer', state: 'NE', name: 'Munroe-Meyer Institute — University of Nebraska', detail: 'Omaha, NE. University-based center specializing in developmental disabilities and autism evaluations.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '402-559-6430', url: 'https://www.unmc.edu/mmi' },
  { id: 'ne_telehealth', state: 'NE', name: 'NE Telehealth Autism Diagnostics', detail: 'Nebraska-licensed telehealth. Serving rural NE families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'NE-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Nevada ── */
  { id: 'nv_renown', state: 'NV', name: 'Renown Children\'s Hospital — Developmental Pediatrics', detail: 'Reno, NV. Northern Nevada\'s primary developmental evaluation center.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '775-982-4000', url: 'https://www.renown.org' },
  { id: 'nv_telehealth', state: 'NV', name: 'NV Telehealth Autism Services', detail: 'Nevada-licensed telehealth. Serving rural NV families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'NV-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── New Hampshire ── */
  { id: 'nh_dartmouth', state: 'NH', name: 'Dartmouth-Hitchcock — Developmental Pediatrics', detail: 'Lebanon, NH. University-based comprehensive autism evaluations for NH families.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '603-650-5000', url: 'https://www.dartmouth-hitchcock.org' },
  { id: 'nh_telehealth', state: 'NH', name: 'NH Telehealth Autism Evaluations', detail: 'New Hampshire-licensed telehealth. Fast scheduling for NH families.', type: 'telehealth', tags: ['Telehealth', 'NH-licensed', 'Fast scheduling', 'Ages 2+'], phone: null, url: null },

  /* ── New Jersey ── */
  { id: 'nj_rutgers', state: 'NJ', name: 'Rutgers Center for Autism Research, Education & Services (CAARES)', detail: 'Piscataway, NJ. University-based autism evaluation and research center.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '732-235-9300', url: 'https://rwjms.rutgers.edu/caares' },
  { id: 'nj_chop_nj', state: 'NJ', name: 'CHOP — New Jersey Locations', detail: 'Multiple NJ locations. Children\'s Hospital of Philadelphia network serving South Jersey families.', type: 'inperson', tags: ['All ages', 'Nationally ranked', 'ADOS-2', 'School-accepted'], phone: '215-590-1000', url: 'https://www.chop.edu' },
  { id: 'nj_telehealth', state: 'NJ', name: 'NJ Telehealth Autism Diagnostics', detail: 'New Jersey-licensed telehealth. Fast scheduling for NJ families.', type: 'telehealth', tags: ['Telehealth', 'NJ-licensed', 'Fast scheduling', 'ADOS-2'], phone: null, url: null },

  /* ── New Mexico ── */
  { id: 'nm_unm', state: 'NM', name: 'UNM Health — Developmental Pediatrics', detail: 'Albuquerque, NM. University of New Mexico\'s primary developmental evaluation program.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '505-272-2200', url: 'https://hsc.unm.edu' },
  { id: 'nm_telehealth', state: 'NM', name: 'NM Telehealth Autism Services', detail: 'New Mexico-licensed telehealth. Serving rural NM and tribal communities with limited local access.', type: 'telehealth', tags: ['Telehealth', 'NM-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── New York ── */
  { id: 'ny_columbia', state: 'NY', name: 'Columbia University — Center for Autism and the Developing Brain', detail: 'White Plains, NY. World-class autism evaluation center affiliated with Columbia and Weill Cornell.', type: 'inperson', tags: ['All ages', 'World-class', 'ADOS-2', 'ADI-R', 'School-accepted'], phone: '914-997-5959', url: 'https://www.nyp.org/cadb' },
  { id: 'ny_nyu', state: 'NY', name: 'NYU Langone — Child Study Center', detail: 'New York, NY. Comprehensive autism evaluations at one of the nation\'s top academic medical centers.', type: 'inperson', tags: ['All ages', 'Nationally ranked', 'ADOS-2', 'School-accepted'], phone: '212-263-6622', url: 'https://www.nyulangone.org/locations/child-study-center' },
  { id: 'ny_telehealth', state: 'NY', name: 'NY Telehealth Autism Diagnostics', detail: 'New York-licensed telehealth. Fast scheduling for families on long NYC hospital waitlists.', type: 'telehealth', tags: ['Telehealth', 'NY-statewide', 'Fast scheduling', 'ADOS-2'], phone: null, url: null },

  /* ── North Carolina ── */
  { id: 'nc_unc', state: 'NC', name: 'UNC TEACCH Autism Program', detail: 'Chapel Hill, NC. World-renowned autism program. Comprehensive evaluations using TEACCH methodology.', type: 'inperson', tags: ['All ages', 'World-class', 'TEACCH', 'ADOS-2', 'School-accepted'], phone: '919-966-2174', url: 'https://teacch.com' },
  { id: 'nc_duke', state: 'NC', name: 'Duke Center for Autism and Brain Development', detail: 'Durham, NC. Duke University comprehensive autism evaluation and research center.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '919-681-0014', url: 'https://autismcenter.duke.edu' },
  { id: 'nc_telehealth', state: 'NC', name: 'NC Telehealth Autism Services', detail: 'North Carolina-licensed telehealth. Serving rural NC families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'NC-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── North Dakota ── */
  { id: 'nd_sanford', state: 'ND', name: 'Sanford Children\'s — Developmental Pediatrics', detail: 'Fargo, ND. North Dakota\'s primary developmental evaluation center.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '701-234-2000', url: 'https://www.sanfordhealth.org' },
  { id: 'nd_telehealth', state: 'ND', name: 'ND Telehealth Autism Evaluations', detail: 'North Dakota-licensed telehealth. Serving rural ND families across the state.', type: 'telehealth', tags: ['Telehealth', 'ND-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Ohio ── */
  { id: 'oh_nationwide', state: 'OH', name: 'Nationwide Children\'s Hospital — Autism Center', detail: 'Columbus, OH. One of the nation\'s top children\'s hospitals with comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'Nationally ranked', 'ADOS-2', 'ADI-R', 'School-accepted'], phone: '614-722-2000', url: 'https://www.nationwidechildrens.org' },
  { id: 'oh_cleveland', state: 'OH', name: 'Cleveland Clinic — Center for Autism', detail: 'Cleveland, OH. World-class evaluation center at Cleveland Clinic.', type: 'inperson', tags: ['All ages', 'World-class', 'ADOS-2', 'School-accepted'], phone: '216-444-2200', url: 'https://my.clevelandclinic.org' },
  { id: 'oh_telehealth', state: 'OH', name: 'OH Telehealth Autism Diagnostics', detail: 'Ohio-licensed telehealth. Fast scheduling for families on long hospital waitlists.', type: 'telehealth', tags: ['Telehealth', 'OH-statewide', 'Fast scheduling', 'ADOS-2'], phone: null, url: null },

  /* ── Oklahoma ── */
  { id: 'ok_ou', state: 'OK', name: 'OU Children\'s — Developmental Pediatrics', detail: 'Oklahoma City, OK. University of Oklahoma\'s primary developmental evaluation program.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '405-271-5000', url: 'https://www.ouhealth.com' },
  { id: 'ok_telehealth', state: 'OK', name: 'OK Telehealth Autism Services', detail: 'Oklahoma-licensed telehealth. Serving rural OK families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'OK-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Oregon ── */
  { id: 'or_ohsu', state: 'OR', name: 'OHSU — Child Development & Rehabilitation Center', detail: 'Portland, OR. Oregon Health & Science University comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '503-494-8311', url: 'https://www.ohsu.edu/cdrc' },
  { id: 'or_telehealth', state: 'OR', name: 'OR Telehealth Autism Evaluations', detail: 'Oregon-licensed telehealth. Serving rural OR families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'OR-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Pennsylvania ── */
  { id: 'pa_chop', state: 'PA', name: 'Children\'s Hospital of Philadelphia — Autism Center', detail: 'Philadelphia, PA. One of the nation\'s top children\'s hospitals. Comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'Nationally ranked', 'ADOS-2', 'ADI-R', 'School-accepted'], phone: '215-590-1000', url: 'https://www.chop.edu/centers-programs/autism-center' },
  { id: 'pa_pitt', state: 'PA', name: 'UPMC Children\'s Hospital — Autism Center', detail: 'Pittsburgh, PA. University of Pittsburgh Medical Center comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '412-692-5325', url: 'https://www.chp.edu' },
  { id: 'pa_telehealth', state: 'PA', name: 'PA Telehealth Autism Diagnostics', detail: 'Pennsylvania-licensed telehealth. Fast scheduling for families on long hospital waitlists.', type: 'telehealth', tags: ['Telehealth', 'PA-statewide', 'Fast scheduling', 'ADOS-2'], phone: null, url: null },

  /* ── Rhode Island ── */
  { id: 'ri_hasbro', state: 'RI', name: 'Hasbro Children\'s Hospital — Developmental Pediatrics', detail: 'Providence, RI. Rhode Island\'s primary children\'s hospital with autism diagnostic services.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '401-444-4000', url: 'https://www.lifespan.org/hasbro-childrens-hospital' },
  { id: 'ri_telehealth', state: 'RI', name: 'RI Telehealth Autism Services', detail: 'Rhode Island-licensed telehealth. Fast scheduling for RI families.', type: 'telehealth', tags: ['Telehealth', 'RI-licensed', 'Fast scheduling', 'Ages 2+'], phone: null, url: null },

  /* ── South Carolina ── */
  { id: 'sc_musc', state: 'SC', name: 'MUSC Children\'s Health — Developmental Pediatrics', detail: 'Charleston, SC. Medical University of South Carolina comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '843-792-1414', url: 'https://musckids.org' },
  { id: 'sc_telehealth', state: 'SC', name: 'SC Telehealth Autism Evaluations', detail: 'South Carolina-licensed telehealth. Serving rural SC families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'SC-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── South Dakota ── */
  { id: 'sd_sanford', state: 'SD', name: 'Sanford Children\'s — Developmental Pediatrics (Sioux Falls)', detail: 'Sioux Falls, SD. South Dakota\'s primary developmental evaluation center.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '605-333-1000', url: 'https://www.sanfordhealth.org' },
  { id: 'sd_telehealth', state: 'SD', name: 'SD Telehealth Autism Diagnostics', detail: 'South Dakota-licensed telehealth. Serving rural SD families across the state.', type: 'telehealth', tags: ['Telehealth', 'SD-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Tennessee ── */
  { id: 'tn_vanderbilt', state: 'TN', name: 'Vanderbilt Kennedy Center — Treatment and Research Institute for Autism', detail: 'Nashville, TN. World-renowned autism evaluation and research center.', type: 'inperson', tags: ['All ages', 'World-class', 'ADOS-2', 'ADI-R', 'School-accepted'], phone: '615-322-8240', url: 'https://vkc.vumc.org/vkc/triad' },
  { id: 'tn_lebonheur', state: 'TN', name: 'Le Bonheur Children\'s Hospital — Developmental Pediatrics', detail: 'Memphis, TN. Comprehensive autism evaluations at West Tennessee\'s leading children\'s hospital.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '901-287-5437', url: 'https://www.lebonheur.org' },
  { id: 'tn_telehealth', state: 'TN', name: 'TN Telehealth Autism Services', detail: 'Tennessee-licensed telehealth. Serving rural TN families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'TN-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Texas ── */
  { id: 'tx_bcm', state: 'TX', name: 'Baylor College of Medicine — Meyer Center for Developmental Pediatrics', detail: 'Houston, TX. One of the nation\'s top autism diagnostic centers, affiliated with Texas Children\'s Hospital.', type: 'inperson', tags: ['All ages', 'Nationally ranked', 'ADOS-2', 'School-accepted'], phone: '832-822-3690', url: 'https://www.bcm.edu/healthcare/care-centers/meyer-center' },
  { id: 'tx_ut_austin', state: 'TX', name: 'UT Austin Autism Research Center', detail: 'Austin, TX. Research and clinical evaluations. Shorter wait times than hospital-based centers for some families.', type: 'inperson', tags: ['Austin area', 'Ages 18mo+', 'School-accepted'], phone: null, url: null },
  { id: 'tx_entire_telehealth', state: 'TX', name: 'Entire Health — Telehealth Autism Evaluations', detail: 'Texas-licensed telehealth provider. ADOS-2 and clinical interviews via video. Reports accepted by most TX school districts.', type: 'telehealth', tags: ['Telehealth', 'TX-statewide', 'ADOS-2', 'School-accepted'], phone: null, url: null },

  /* ── Utah ── */
  { id: 'ut_primary', state: 'UT', name: 'Primary Children\'s Hospital — Developmental Pediatrics', detail: 'Salt Lake City, UT. Utah\'s flagship children\'s hospital with comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '801-662-1000', url: 'https://intermountainhealthcare.org/primary-childrens' },
  { id: 'ut_telehealth', state: 'UT', name: 'UT Telehealth Autism Evaluations', detail: 'Utah-licensed telehealth. Serving rural UT families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'UT-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Vermont ── */
  { id: 'vt_uvmmc', state: 'VT', name: 'UVM Medical Center — Developmental Pediatrics', detail: 'Burlington, VT. University of Vermont\'s primary developmental evaluation program.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '802-847-0000', url: 'https://www.uvmhealth.org' },
  { id: 'vt_telehealth', state: 'VT', name: 'VT Telehealth Autism Services', detail: 'Vermont-licensed telehealth. Serving rural VT families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'VT-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Virginia ── */
  { id: 'va_chkd', state: 'VA', name: 'CHKD Developmental Behavioral Pediatrics', detail: 'Norfolk, VA. Children\'s Hospital of the King\'s Daughters — one of VA\'s most established autism evaluation centers.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '757-668-7243', url: 'https://www.chkd.org/services/autism-diagnostic-center/' },
  { id: 'va_uva', state: 'VA', name: 'UVA Neurodevelopmental & Behavioral Pediatrics', detail: 'Charlottesville, VA. University of Virginia program with comprehensive developmental and autism evaluations.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'School-accepted'], phone: '434-924-8832', url: null },
  { id: 'va_telehealth_kp', state: 'VA', name: 'Kennedy Krieger Institute — Telehealth Diagnostic', detail: 'Maryland-based, licensed in VA. Nationally recognized autism diagnostic program with telehealth options for Virginia families.', type: 'telehealth', tags: ['VA-licensed telehealth', 'Nationally recognized', 'ADOS-2', 'Ages 2+'], phone: '443-923-9400', url: 'https://www.kennedykrieger.org/patient-care/centers-and-programs/center-for-autism-and-related-disorders' },

  /* ── Washington ── */
  { id: 'wa_seattle_childrens', state: 'WA', name: 'Seattle Children\'s — Autism Center', detail: 'Seattle, WA. One of the nation\'s top children\'s hospitals with comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'Nationally ranked', 'ADOS-2', 'School-accepted'], phone: '206-987-2000', url: 'https://www.seattlechildrens.org/clinics/autism-center' },
  { id: 'wa_uw', state: 'WA', name: 'UW Autism Center', detail: 'Seattle, WA. University of Washington research and clinical evaluation center.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'ADI-R', 'School-accepted'], phone: '206-221-6806', url: 'https://depts.washington.edu/uwautism' },
  { id: 'wa_telehealth', state: 'WA', name: 'WA Telehealth Autism Diagnostics', detail: 'Washington-licensed telehealth. Serving rural WA families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'WA-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── West Virginia ── */
  { id: 'wv_wvu', state: 'WV', name: 'WVU Medicine Children\'s — Developmental Pediatrics', detail: 'Morgantown, WV. West Virginia University\'s primary developmental evaluation program.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '304-598-4000', url: 'https://wvumedicine.org/childrens' },
  { id: 'wv_telehealth', state: 'WV', name: 'WV Telehealth Autism Services', detail: 'West Virginia-licensed telehealth. Serving rural WV Appalachian families with limited local access.', type: 'telehealth', tags: ['Telehealth', 'WV-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Wisconsin ── */
  { id: 'wi_chw', state: 'WI', name: 'Children\'s Wisconsin — Developmental Pediatrics', detail: 'Milwaukee, WI. Wisconsin\'s leading children\'s hospital with comprehensive autism evaluations.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'ADOS-2', 'School-accepted'], phone: '414-266-2000', url: 'https://childrenswi.org' },
  { id: 'wi_uw', state: 'WI', name: 'UW Health — Waisman Center', detail: 'Madison, WI. University of Wisconsin research and clinical evaluation center for developmental disabilities.', type: 'inperson', tags: ['All ages', 'University-affiliated', 'ADOS-2', 'School-accepted'], phone: '608-263-5776', url: 'https://www.waisman.wisc.edu' },
  { id: 'wi_telehealth', state: 'WI', name: 'WI Telehealth Autism Evaluations', detail: 'Wisconsin-licensed telehealth. Serving rural WI families with fast scheduling.', type: 'telehealth', tags: ['Telehealth', 'WI-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Wyoming ── */
  { id: 'wy_uchealth', state: 'WY', name: 'UCHealth — Developmental Pediatrics (Cheyenne)', detail: 'Cheyenne, WY. Primary developmental evaluation center for Wyoming families.', type: 'inperson', tags: ['All ages', 'Hospital-based', 'School-accepted'], phone: '307-778-1000', url: 'https://www.uchealth.org' },
  { id: 'wy_telehealth', state: 'WY', name: 'WY Telehealth Autism Diagnostics', detail: 'Wyoming-licensed telehealth. Serving rural WY families across the state\'s vast geography.', type: 'telehealth', tags: ['Telehealth', 'WY-licensed', 'Rural-friendly', 'Ages 2+'], phone: null, url: null },

  /* ── Nationwide (shown when state is unknown or as supplement) ── */
  { id: 'national_kennedy_krieger', state: 'NATIONAL', name: 'Kennedy Krieger Institute — Telehealth (Nationwide)', detail: 'Baltimore, MD. Nationally recognized autism diagnostic program. Telehealth available in most states.', type: 'telehealth', tags: ['Nationwide telehealth', 'Nationally recognized', 'ADOS-2', 'Ages 2+'], phone: '443-923-9400', url: 'https://www.kennedykrieger.org' },
  { id: 'national_autism_speaks', state: 'NATIONAL', name: 'Autism Speaks Provider Network', detail: 'Nationwide. Curated network of telehealth and in-person providers specializing in autism evaluations.', type: 'both', tags: ['Nationwide', 'Telehealth + In-person', 'ADOS-2', 'Ages 18mo+'], phone: '888-288-4762', url: 'https://www.autismspeaks.org/resource-guide' },
];

/** Returns evaluators for a given state, plus NATIONAL fallbacks */
export function getEvaluatorsForState(state: string): Evaluator[] {
  const stateUpper = (state || '').toUpperCase().trim();
  const stateMatches = EVALUATORS.filter(e => e.state === stateUpper);
  if (stateMatches.length > 0) return stateMatches;
  // Fallback to national providers if state not found
  return EVALUATORS.filter(e => e.state === 'NATIONAL');
}

/** Maps full state names to 2-letter codes */
export const STATE_ABBR: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY',
};

export function normalizeState(input: string): string {
  if (!input) return '';
  const lower = input.toLowerCase().trim();
  // If it's already a 2-letter code
  if (input.length === 2) return input.toUpperCase();
  return STATE_ABBR[lower] || input.toUpperCase();
}
