// State-specific Medicaid disability pathway data
// Beta states: Texas, Colorado, Virginia, Delaware

export interface MedicaidStateData {
  stateCode: string;
  stateName: string;
  // Disability determination
  programName: string;          // What the disability determination process is called
  programAcronym: string;       // Short acronym if applicable
  // Provider documentation
  requiredForm: string;         // Name of the form providers complete
  requiredFormNote: string;     // Short note explaining the form
  // Income rules
  incomeRuleHeadline: string;   // One-line summary for the yellow box
  incomeRuleDetail: string;     // Full explanation
  // Application
  applicationUrl: string;       // Direct URL to apply
  applicationPortalName: string; // Name of the portal
  // Waiver programs
  waiverPrograms: { name: string; acronym: string; description: string }[];
  // Contact
  medicaidPhone: string;
  // State-specific tips
  stateTip: string;
  // Phone script for "if you need help"
  phoneScript: string;
}

export const MEDICAID_STATES: Record<string, MedicaidStateData> = {
  CO: {
    stateCode: 'CO',
    stateName: 'Colorado',
    programName: 'Long-Term Disability Determination',
    programAcronym: 'LTD',
    requiredForm: 'Professional Medical Information Page (PMIP)',
    requiredFormNote:
      'The PMIP is completed by your child\'s doctor and documents their functional limitations. It is required before your child can be assessed for waiver eligibility.',
    incomeRuleHeadline:
      'Household income does not count for disability-based Medicaid pathways in Colorado.',
    incomeRuleDetail:
      'Colorado\'s Medicaid Buy-In Program for Children with Disabilities disregards household income. Eligibility is based on your child\'s disability status. Families may pay a small monthly premium based on income.',
    applicationUrl: 'https://colorado.gov/PEAK',
    applicationPortalName: 'PEAK (Colorado)',
    waiverPrograms: [
      {
        name: "Children's Extensive Support Waiver",
        acronym: 'CES',
        description:
          'Supports children with intellectual and developmental disabilities to remain in the family home.',
      },
      {
        name: 'Supported Living Services',
        acronym: 'SLS',
        description:
          'Provides services and supports for individuals with developmental disabilities.',
      },
      {
        name: 'Children with Complex Health Needs',
        acronym: 'CxCHN',
        description:
          'Medicaid-funded program for children with significant medical or behavioral needs.',
      },
    ],
    medicaidPhone: '1-800-711-6994',
    stateTip:
      'Colorado uses the PMIP form specifically — ask your provider for it by name. Once your child has LTD approval, you can apply for the CES Waiver through your county.',
    phoneScript:
      '"I'd like to submit an LTD application for my child. They have a completed PMIP form from their provider. Can you tell me the process and where to submit?"',
  },

  TX: {
    stateCode: 'TX',
    stateName: 'Texas',
    programName: 'Disability Determination',
    programAcronym: 'DDU',
    requiredForm: 'Form 3052 – Practitioner\'s Statement of Medical Need',
    requiredFormNote:
      'Texas uses Form 3052, completed by your child\'s doctor, to document medical necessity for HCBS waiver services.',
    incomeRuleHeadline:
      'Parental income is generally not counted for most Texas HCBS waiver programs.',
    incomeRuleDetail:
      'For most HCBS waivers in Texas, parental income is not considered — eligibility is based on your child\'s disability and functional needs. Texas also offers the Medicaid Buy-In for Children (MBIC) program for families who need coverage based on income.',
    applicationUrl: 'https://www.yourtexasbenefits.com',
    applicationPortalName: 'Your Texas Benefits',
    waiverPrograms: [
      {
        name: 'Home and Community-based Services',
        acronym: 'HCS',
        description:
          'Provides residential and day services for individuals with intellectual disabilities and related conditions, including autism.',
      },
      {
        name: 'Texas Home Living',
        acronym: 'TxHmL',
        description:
          'Supports individuals with intellectual disabilities to live in their own home or family home.',
      },
      {
        name: 'Community Living Assistance and Support Services',
        acronym: 'CLASS',
        description:
          'Supports individuals with related conditions (including autism) who need help with daily activities.',
      },
      {
        name: 'Medically Dependent Children Program',
        acronym: 'MDCP',
        description:
          'Supports medically dependent children who would otherwise require nursing facility care.',
      },
    ],
    medicaidPhone: '1-877-438-5658',
    stateTip:
      'Texas waiver waitlists can be extremely long — sometimes over a decade. Apply to all applicable interest lists as early as possible, even before your child is fully approved.',
    phoneScript:
      '"I'd like to submit a disability-based Medicaid application for my child. I have provider documentation of their needs (Form 3052). Can you tell me the process and where to submit?"',
  },

  VA: {
    stateCode: 'VA',
    stateName: 'Virginia',
    programName: 'Developmental Disability Eligibility Determination',
    programAcronym: 'DD Eligibility',
    requiredForm: 'Virginia Individual Developmental Disabilities Eligibility Survey (VIDES)',
    requiredFormNote:
      'The VIDES is a functional assessment completed with your family to determine eligibility for Virginia\'s DD waiver programs. It evaluates your child\'s daily living skills and support needs.',
    incomeRuleHeadline:
      'Family income is excluded for children qualifying through Virginia\'s disability-based Medicaid pathway.',
    incomeRuleDetail:
      'Virginia\'s DD waiver programs do not count parental income for eligibility. Children who qualify based on disability status can receive waiver services regardless of household income.',
    applicationUrl: 'https://commonhelp.virginia.gov/',
    applicationPortalName: 'CommonHelp (Virginia)',
    waiverPrograms: [
      {
        name: 'Family and Individual Support Waiver',
        acronym: 'FIS',
        description:
          'Supports individuals with developmental disabilities living with family or independently in the community.',
      },
      {
        name: 'Community Living Waiver',
        acronym: 'CL',
        description:
          'Provides residential and day support services for individuals with developmental disabilities.',
      },
      {
        name: 'Building Independence Waiver',
        acronym: 'BI',
        description:
          'Supports individuals with developmental disabilities who live independently and need minimal support.',
      },
    ],
    medicaidPhone: '1-855-242-8282',
    stateTip:
      'Virginia assigns waiver slots based on urgency of need. The VIDES assessment is a key step — contact your local Community Services Board (CSB) to get started, as they manage the eligibility and waitlist process.',
    phoneScript:
      '"I'd like to start the process for my child's developmental disability eligibility determination for Medicaid waiver services. Can you tell me how to get the VIDES assessment scheduled?"',
  },

  DE: {
    stateCode: 'DE',
    stateName: 'Delaware',
    programName: "Children's Community Alternative Disability Program",
    programAcronym: 'CCADP',
    requiredForm: "Attending Physician's Certification & Comprehensive Medical Report",
    requiredFormNote:
      "Delaware's CCADP requires an Attending Physician's Certification and a Comprehensive Medical Report documenting your child's disability and level of care needs.",
    incomeRuleHeadline:
      'Parental income and resources are not considered for CCADP eligibility in Delaware.',
    incomeRuleDetail:
      "Delaware's Children's Community Alternative Disability Program (CCADP) determines eligibility without regard to parental income, resources, or other health insurance — as long as your child meets the required level of care.",
    applicationUrl: 'https://www.assist.dhss.delaware.gov',
    applicationPortalName: 'ASSIST (Delaware)',
    waiverPrograms: [
      {
        name: 'DDDS Lifespan Waiver',
        acronym: 'Lifespan',
        description:
          'Provides home and community-based services for individuals with intellectual disabilities and autism spectrum disorder, ages 12 and up.',
      },
      {
        name: "Children's Community Alternative Disability Program",
        acronym: 'CCADP',
        description:
          'A TEFRA-like program providing Medicaid coverage for children with disabilities regardless of parental income.',
      },
    ],
    medicaidPhone: '1-866-843-7212',
    stateTip:
      "Delaware's CCADP was formerly called the Disabled Children's Program. Initial approval is generally for up to one year and must be renewed. The DDDS Lifespan Waiver is available starting at age 12.",
    phoneScript:
      '"I'd like to apply for the Children's Community Alternative Disability Program (CCADP) for my child. Can you tell me what documentation I need and how to get started?"',
  },
  AK: {
    stateCode: 'AK',
    stateName: 'Alaska',
    programName: 'Disabled Children at Home (TEFRA)',
    programAcronym: 'TEFRA',
    requiredForm: 'Med 1 — Child\'s Medical History and Disability Report',
    requiredFormNote:
      'The Med 1 form is used to gather detailed information about the child\'s medical history and disabling condition. It is typically completed by the child\'s parent or guardian and submitted along with medical records to establish the child\'s level of care need.',
    incomeRuleHeadline:
      'Parental income is excluded when determining eligibility for the TEFRA program.',
    incomeRuleDetail:
      'For the TEFRA program, only the child\'s income and resources are counted when determining eligibility. The parents\' income and resources are not counted. This allows children with significant disabilities to qualify for Medicaid even if their parents\' income exceeds standard Medicaid limits.',
    applicationUrl: 'https://health.alaska.gov/en/services/division-of-public-assistance-dpa-services/apply-for-medicaid/',
    applicationPortalName: 'myAlaska',
    waiverPrograms: [
      {
        name: 'Individualized Supports Waiver',
        acronym: 'ISW',
        description: 'Provides supports for children and adults with intellectual and developmental disabilities, including autism, to live in their own homes or with family.',
      },
      {
        name: 'Intellectual and Developmental Disabilities Waiver',
        acronym: 'IDD',
        description: 'Offers comprehensive services for individuals with intellectual and developmental disabilities who require an ICF/IID level of care.',
      },
      {
        name: 'Children with Complex Medical Conditions',
        acronym: 'CCMC',
        description: 'Provides services for Medicaid-eligible children up to age 21 with serious medical conditions who require a nursing facility level of care.',
      }
    ],
    medicaidPhone: '1-800-478-7778',
    stateTip:
      'Alaska\'s TEFRA program requires both a general Medicaid application (Med 4) and specific medical forms (Med 1) to be submitted, and the medical review is conducted by Comagine Health.',
    phoneScript:
      '"I am calling to apply for the TEFRA Medicaid program for my child with a disability. Can you help me start the application process and tell me where to send the Med 1 and Med 4 forms?"',
  },
  AL: {
    stateCode: 'AL',
    stateName: 'Alabama',
    programName: 'Intellectual Disabilities (ID) Waiver for Persons with Intellectual Disabilities',
    programAcronym: 'ID Waiver',
    requiredForm: 'Form 206',
    requiredFormNote:
      'Form 206 is a Medicaid Eligibility Handout that provides general information on Medicaid eligibility and programs in Alabama.',
    incomeRuleHeadline:
      'Parental income is not directly excluded for the ID, LAH, and CWP waivers, but eligibility is based on the child\'s income and resources, and the child must meet institutional level of care criteria.',
    incomeRuleDetail:
      'For the Intellectual Disabilities (ID) Waiver, Living at Home (LAH) Waiver, and Community Waiver Program (CWP) for groups one through four, the income limit is $2,982 per month and the resource limit is $2,000 as of the first day of each month. For CWP group five, the income limit is at or below 150% of the Federal Poverty Level (FPL) with an earned income disregard between 150% FPL and 250% FPL with no resource test.',
    applicationUrl: 'https://insurealabama.adph.state.al.us/',
    applicationPortalName: 'Not specified for disability-based Medicaid for children, but general application portal is Insure Alabama.',
    waiverPrograms: [
      {
        name: 'Living at Home Waiver for Persons with Intellectual Disabilities',
        acronym: 'LAH Waiver',
        description: 'This waiver serves individuals with intellectual disabilities (age three and above) who meet institutional care criteria and would receive Medicaid coverage in the community.',
      },
      {
        name: 'Community Waiver Program',
        acronym: 'CWP',
        description: 'This waiver serves individuals with intellectual disabilities (age three and above) in five enrollment groups, providing community-based services.',
      },
      {
        name: 'Alabama Community Transition Waiver',
        acronym: 'ACT Waiver',
        description: 'This waiver serves individuals with disabilities or long-term care illnesses who currently reside in an institution and desire to transition to the home or community setting.',
      }
    ],
    medicaidPhone: '1-800-361-4491',
    stateTip:
      'Waiver program enrollment is limited and a waiting period may be necessary for some programs. Contact the Department of Mental Health Call Center early to inquire about waitlists.',
    phoneScript:
      '"I am calling to inquire about the Intellectual Disabilities Waiver for my child with autism/developmental disabilities. Can you guide me through the application process and explain the eligibility requirements?"',
  },
  AR: {
    stateCode: 'AR',
    stateName: 'Arkansas',
    programName: 'Tax Equity and Fiscal Responsibility Act',
    programAcronym: 'TEFRA',
    requiredForm: 'Physician Assessment form (DMS-2602)',
    requiredFormNote:
      'This form is completed by the child\'s medical provider(s) to establish the child\'s disability and level of care needs.',
    incomeRuleHeadline:
      'Parental income is excluded when determining eligibility for the TEFRA program.',
    incomeRuleDetail:
      'The TEFRA program allows children with disabilities to qualify for Medicaid based on the child\'s income alone. Parental income is not counted for eligibility, though families with higher incomes may be required to pay a premium on a sliding scale.',
    applicationUrl: 'https://access.arkansas.gov/',
    applicationPortalName: 'Access Arkansas',
    waiverPrograms: [
      {
        name: 'Community and Employment Support Waiver',
        acronym: 'CES',
        description: 'Offers services in the community to support clients with intellectual or developmental disabilities with all major life activities.',
      },
      {
        name: 'Autism Waiver',
        acronym: 'AW',
        description: 'Provides one-on-one, intensive early intervention treatment to eligible children ages 18 months to 5 years with a diagnosis of autism.',
      }
    ],
    medicaidPhone: '1-855-372-1084',
    stateTip:
      'DHS has up to 90 days to determine eligibility if your child\'s disability has not already been established by the Social Security Administration.',
    phoneScript:
      '"I would like to apply for the TEFRA Medicaid program for my child with a disability."',
  },
  AZ: {
    stateCode: 'AZ',
    stateName: 'Arizona',
    programName: 'Arizona Long Term Care System (ALTCS) in conjunction with the Division of Developmental Disabilities (DDD)',
    programAcronym: 'ALTCS/DDD',
    requiredForm: 'DDD-1972A (DDD Application)',
    requiredFormNote:
      'This form is the specific application for services through the Division of Developmental Disabilities (DDD). It is completed by the parent or legal guardian to initiate the eligibility determination process for children with developmental disabilities.',
    incomeRuleHeadline:
      'Parental income is excluded for disability-based Medicaid eligibility.',
    incomeRuleDetail:
      'If a child qualifies for Medicaid based on disability, eligibility is determined solely by the child\'s income, and parental income is not considered. This allows children from higher-income families to access necessary services.',
    applicationUrl: 'https://www.healthearizonaplus.gov/',
    applicationPortalName: 'Health-e-Arizona Plus',
    waiverPrograms: [
      {
        name: 'Arizona Long Term Care System (ALTCS) 1115 Demonstration Waiver',
        acronym: 'ALTCS 1115 Waiver',
        description: 'This waiver provides a comprehensive range of home and community-based services for children with disabilities, including attendant care, habilitation, therapies, and home modifications.',
      }
    ],
    medicaidPhone: '1-800-654-8713',
    stateTip:
      'Arizona operates an 1115 demonstration waiver that allows for parental income to be excluded for disability-based Medicaid. Be aware that there may be waiting lists for some services, so it is advisable to apply as early as possible.',
    phoneScript:
      '"I am calling to inquire about applying for Medicaid for my child with a developmental disability, specifically regarding the Arizona Long Term Care System (ALTCS) and Division of Developmental Disabilities (DDD) programs, where parental income is not counted."',
  },
  CA: {
    stateCode: 'CA',
    stateName: 'California',
    programName: 'Medi-Cal Home- and Community-Based Services Developmental Disability Waiver',
    programAcronym: 'HCBS-DD Waiver',
    requiredForm: 'DS 1890 form (Client Development Evaluation Report - CDER update)',
    requiredFormNote:
      'The DS 1890 form, along with a CDER update, is completed by the Regional Center Service Coordinator to document why a child needs an institutional level of care for the waiver.',
    incomeRuleHeadline:
      'Parental income is excluded for disability-based Medi-Cal pathways.',
    incomeRuleDetail:
      'When a child is enrolled on an HCBS waiver, the state uses "institutional deeming," meaning only the child\'s income and resources are counted, not the parents\'. This allows children from families with higher incomes to qualify for full-scope Medi-Cal.',
    applicationUrl: 'https://benefitscal.com/ApplyForBenefits/begin/ABOVR',
    applicationPortalName: 'BenefitsCal',
    waiverPrograms: [
      {
        name: 'HCBS Waiver for Californians with Developmental Disabilities',
        acronym: 'HCBS-DD Waiver',
        description: 'This waiver, administered through Regional Centers, is the most common for children with intellectual disabilities, autism, cerebral palsy, and epilepsy.',
      },
      {
        name: 'Home and Community-Based Alternatives Waiver',
        acronym: 'HCBA Waiver',
        description: 'This waiver is for people of any age who would otherwise need nursing facility care, often used by medically fragile children not covered by the HCBS-DD Waiver.',
      },
      {
        name: 'Self-Determination Program Waiver',
        acronym: 'SDP Waiver',
        description: 'This program offers participants and their families more control over their services and supports.',
      }
    ],
    medicaidPhone: '1-800-541-5555',
    stateTip:
      'While the DDS HCBS Waiver does not have a waiting list, the application process can take 90 to 180 days due to bottlenecks at Regional Center intake, LOC assessment, and county Medi-Cal enrollment.',
    phoneScript:
      '"I am calling to inquire about applying for Medi-Cal for my child with a developmental disability under the DDS HCBS Waiver, where parental income is not counted. Can you guide me through the process?"',
  },
  CT: {
    stateCode: 'CT',
    stateName: 'Connecticut',
    programName: 'Katie Beckett Waiver',
    programAcronym: '',
    requiredForm: 'Katie Beckett Model Waiver Assessment Form, W-1630',
    requiredFormNote:
      'A registered nurse from a Medicaid-enrolled Home Health Agency performs this waiver assessment to develop a plan of care and determine medical eligibility and institutional level of care.',
    incomeRuleHeadline:
      'Parental income is excluded for the Katie Beckett Waiver.',
    incomeRuleDetail:
      'The Katie Beckett Waiver allows children to qualify for Medicaid based on their own income and resources, without considering parental income. However, the individual\'s income must be listed.',
    applicationUrl: 'https://www.connect.ct.gov/',
    applicationPortalName: 'ConneCT',
    waiverPrograms: [
      {
        name: 'Home and Community Supports Waiver for Persons with Autism',
        acronym: '',
        description: 'Provides home- and community-based services to individuals with autism aged 3 or older who meet an ICF/IID level of care.',
      },
      {
        name: 'Individual and Family Support Waiver',
        acronym: '',
        description: 'Provides in-home, employment/vocational, and family support services for people who live in their own home, a family home or licensed settings.',
      },
      {
        name: 'Employment and Day Supports Waiver',
        acronym: '',
        description: 'Provides adult day health, blended supports, group day supports, and individual supported employment.',
      }
    ],
    medicaidPhone: '1-860-424-4904',
    stateTip:
      'Due to limited slots, applicants may be placed on a waiting list. Contact the DSS Community Options Unit to be placed on the waiting list.',
    phoneScript:
      '"I am calling to inquire about the Katie Beckett Waiver program for my child with a disability and to be placed on the waiting list. Can you please guide me through the initial steps?"',
  },
  FL: {
    stateCode: 'FL',
    stateName: 'Florida',
    programName: 'Developmental Disabilities Individual Budgeting (iBudget Waiver)',
    programAcronym: 'iBudget Waiver',
    requiredForm: 'Application for Services',
    requiredFormNote:
      'This form is used to apply for services from the Agency for Persons with Disabilities (APD). It requires documentation of a developmental disability, and APD may assist with a comprehensive assessment if needed.',
    incomeRuleHeadline:
      'Parental income is generally excluded for the iBudget Waiver.',
    incomeRuleDetail:
      'For the iBudget Waiver, eligibility is based on the child\'s disability and their income, not the income of their parents. This allows children from higher-income families to qualify for necessary services.',
    applicationUrl: 'https://myaccess.myflfamilies.com/',
    applicationPortalName: 'MyACCESS',
    waiverPrograms: [
      {
        name: 'Developmental Disabilities Individual Budgeting Waiver',
        acronym: 'iBudget Waiver',
        description: 'Provides home and community-based services to individuals with autism, developmental disabilities, or intellectual disabilities ages 3 or older who meet an ICF/IID level of care.',
      },
      {
        name: 'Familial Dysautonomia Waiver',
        acronym: '',
        description: 'Provides services to medically fragile children and adults diagnosed with familial dysautonomia who meet a hospital level of care.',
      },
      {
        name: 'Model Waiver',
        acronym: '',
        description: 'Provides services to medically fragile and technology-dependent children (0-20 years) who are at risk for hospitalization or in nursing facilities.',
      }
    ],
    medicaidPhone: '1-877-254-1055',
    stateTip:
      'Florida\'s iBudget Waiver historically has a very long waiting list, so it is advisable to apply as early as possible.',
    phoneScript:
      '"I am calling to inquire about applying for Medicaid services for my child with a developmental disability, specifically the iBudget Waiver. Can you guide me through the application process and any specific forms required?"',
  },
  GA: {
    stateCode: 'GA',
    stateName: 'Georgia',
    programName: 'TEFRA/Katie Beckett Medicaid Program',
    programAcronym: 'TEFRA/KB',
    requiredForm: 'Pediatric DMA (6 (A), Medical Necessity Level of Care Statement',
    requiredFormNote:
      'The Pediatric DMA (6 (A) and Medical Necessity Level of Care Statement are forms used to determine the institutional level of care a child requires for Katie Beckett eligibility. These forms should be interpreted by medical personnel.',
    incomeRuleHeadline:
      'Parental income is excluded for eligibility in the Katie Beckett Medicaid Program.',
    incomeRuleDetail:
      'The Katie Beckett Medicaid Program (KB) permits the state to ignore family income for certain children who are disabled. It provides benefits to certain children 18 years of age or less who qualify as disabled individuals under §1614 of the Social Security Act and who live at home rather than in an institution.',
    applicationUrl: 'https://www.gateway.ga.gov/',
    applicationPortalName: 'Georgia Gateway',
    waiverPrograms: [
      {
        name: 'New Options Waiver Program',
        acronym: 'NOW',
        description: 'Provides services and support for people with intellectual or developmental disabilities.',
      },
      {
        name: 'Comprehensive Supports Waiver Program',
        acronym: 'COMP',
        description: 'Provides services and support for people with intellectual or developmental disabilities.',
      },
      {
        name: 'Georgia Pediatric Program',
        acronym: 'GAPP',
        description: 'Provides services to medically fragile children with multiple system diagnoses in their homes and communities.',
      }
    ],
    medicaidPhone: '1-678-248-7449',
    stateTip:
      'Effective immediately, all medical level of care determinations for Katie Beckett approval will be authorized for a period of no less than two years.',
    phoneScript:
      '"I am calling to inquire about applying for the Katie Beckett Medicaid Program for my child with a disability. Could you please guide me through the application process and any required forms?"',
  },
  HI: {
    stateCode: 'HI',
    stateName: 'Hawaii',
    programName: 'HCB Services for People with Intellectual and Developmental Disabilities (I/DD)',
    programAcronym: 'I/DD Waiver',
    requiredForm: 'Request to Participate in Home and Community-Based Services for People with Intellectual and Developmental Disabilities form',
    requiredFormNote:
      'This form is used to express interest in applying for the Medicaid I/DD Waiver and is completed with the assistance of a case manager.',
    incomeRuleHeadline:
      'Parental income is not counted for the HCB Services for People with Intellectual and Developmental Disabilities (I/DD) waiver.',
    incomeRuleDetail:
      'For the HCB Services for People with Intellectual and Developmental Disabilities (I/DD) waiver, eligibility is based on the child\'s income only, and parent income is not counted.',
    applicationUrl: 'https://medical.mybenefits.hawaii.gov',
    applicationPortalName: 'Med-QUEST',
    waiverPrograms: [
      {
        name: 'HCB Services for People with Intellectual and Developmental Disabilities (I/DD)',
        acronym: 'I/DD Waiver',
        description: 'Provides adult day health, discovery & career planning, individual employment supports, personal assistance/habilitation, residential habilitation, respite, additional residential supports, assistive technology, chore, community learning services, community navigator, environmental accessibility adaptations, non-medical transportation, personal emergency response system, private duty nursing, specialized medical equipment and supplies, training and consultation, vehicle modifications, and waiver emergency services to individuals with intellectual disabilities or developmental disabilities ages 0 or older who meet an ICF/IID level of care.',
      },
      {
        name: 'Quest Hawaii - Quest Integration',
        acronym: 'QUEST Integration',
        description: 'Hawaii’s QUEST Integration program is a statewide section 1115 demonstration that provides Medicaid coverage for medical, dental, and behavioral health services through competitive managed care delivery systems.',
      }
    ],
    medicaidPhone: '1-800-316-8005',
    stateTip:
      'Contact the Developmental Disabilities Division (DDD) case manager to initiate the application process for the I/DD Waiver.',
    phoneScript:
      '"I am calling to inquire about the Medicaid I/DD Waiver for my child with a developmental disability. Can you connect me with someone who can help me with the application process?"',
  },
  IA: {
    stateCode: 'IA',
    stateName: 'Iowa',
    programName: 'Children and Youth Waiver',
    programAcronym: 'C&Y Waiver',
    requiredForm: 'Medicaid application (with Appendix A for Health Coverage), Waiver Priority Needs Assessment (WPNA) form',
    requiredFormNote:
      'The Medicaid application is the general application; in Appendix A, check boxes for \'Services to remain in your home\' and the Children and Youth waiver. The WPNA form is optional but helps prioritize a child based on unmet needs for waiver slots.',
    incomeRuleHeadline:
      'Parental income and resources are not considered for the Children and Youth waiver.',
    incomeRuleDetail:
      'Medicaid will not consider parent income or resources when deciding a child’s financial eligibility for the Children and Youth waiver. The child\'s own income must be less than three times the current year’s Federal Supplemental Security Income (SSI) limit per month, which is $35,788.38 per year for 2026.',
    applicationUrl: 'https://hhsservices.iowa.gov/apspssp/ssp.portal',
    applicationPortalName: 'HHS Benefits Portal',
    waiverPrograms: [
      {
        name: 'Children\'s Mental Health Waiver',
        acronym: 'CMH Waiver',
        description: 'Provides home and community-based services for children with a serious emotional disturbance.',
      },
      {
        name: 'Intellectual Disability Waiver',
        acronym: 'ID Waiver',
        description: 'Provides services and supports for individuals with intellectual disabilities to live in their own homes or communities.',
      },
      {
        name: 'Brain Injury Waiver',
        acronym: 'BI Waiver',
        description: 'Provides services and supports for individuals with a brain injury to live in their own homes or communities.',
      }
    ],
    medicaidPhone: '1-800-338-8366',
    stateTip:
      'The Children and Youth waiver has a waitlist. Completing the optional Waiver Priority Needs Assessment (WPNA) form can help prioritize a child based on their unmet needs for a waiver slot.',
    phoneScript:
      '"I am calling to inquire about applying for the Children and Youth Waiver for my child with a disability, and I would like to understand the application process and any required forms, including the Waiver Priority Needs Assessment."',
  },
  ID: {
    stateCode: 'ID',
    stateName: 'Idaho',
    programName: 'Katie Beckett Program',
    programAcronym: '',
    requiredForm: 'Katie Beckett program packet and Level of Care Determination',
    requiredFormNote:
      'The Katie Beckett program packet is sent by Liberty Healthcare after applying for Medicaid and is used to assess the child\'s disability and level of care. A Level of Care Determination is an independent assessment conducted by Liberty Healthcare to determine if the child meets the requirements for Katie Beckett services.',
    incomeRuleHeadline:
      'Parental income is excluded for eligibility in the Katie Beckett Program.',
    incomeRuleDetail:
      'The Katie Beckett program allows children with long-term disabilities or complex medical needs to be eligible for Medicaid services even if their family income is above federal poverty guidelines. A premium may be assessed based on family income, but inability to pay will not impact eligibility.',
    applicationUrl: 'https://idalink.idaho.gov/',
    applicationPortalName: 'idalink',
    waiverPrograms: [
      {
        name: 'Children\'s Developmental Disabilities Program',
        acronym: 'CDDP',
        description: 'This program provides a system of home and community-based services for children with developmental disabilities, including intervention and support services.',
      }
    ],
    medicaidPhone: '1-888-528-5861',
    stateTip:
      'When applying for Medicaid, write "Katie Beckett" at the top of the application form to indicate interest in this specific program.',
    phoneScript:
      '"I am calling to apply for the Katie Beckett Medicaid program for my child with a disability. Can you guide me through the application process and explain the next steps for the program packet and Level of Care Determination?"',
  },
  IL: {
    stateCode: 'IL',
    stateName: 'Illinois',
    programName: 'Illinois Medicaid Waivers for Children with Disabilities',
    programAcronym: '',
    requiredForm: 'PUNS (Prioritization of Urgency of Need for Services)',
    requiredFormNote:
      'PUNS is a statewide database that registers individuals with developmental disabilities who are in need of services. Registration is done through an Independent Service Coordination (ISC) agency.',
    incomeRuleHeadline:
      'Parental income is not counted for specific disability-based Medicaid waivers for children in Illinois.',
    incomeRuleDetail:
      'For the Medically Fragile Technology Dependent Waiver, Support Waiver for Children and Young Adults with Developmental Disabilities, and Residential Waiver for Children and Young Adults with Developmental Disabilities, parental income is not a factor. However, for other Medicaid waivers, a child generally needs to be income eligible for Medicaid where parental income is counted up to age 18.',
    applicationUrl: 'https://abe.illinois.gov/abe/access/',
    applicationPortalName: 'Illinois Application for Benefits Eligibility (ABE)',
    waiverPrograms: [
      {
        name: 'Medically Fragile Technology Dependent Waiver',
        acronym: 'MFTD',
        description: 'This waiver provides services and individualized support to children with special healthcare needs who are medically fragile and technology dependent, preventing institutionalization.',
      },
      {
        name: 'Support Waiver for Children and Young Adults with Developmental Disabilities',
        acronym: '',
        description: 'This waiver provides services to children and young adults with intellectual or developmental disabilities to help them remain in their homes and communities.',
      },
      {
        name: 'Residential Waiver for Children and Young Adults with Developmental Disabilities',
        acronym: '',
        description: 'This waiver provides 24-hour residential supports to eligible children and young adults with developmental disabilities.',
      }
    ],
    medicaidPhone: '1-800-843-6154',
    stateTip:
      'Families interested in the DD Waivers (Support or Residential) should register their child on the PUNS waiting list through their Independent Service Coordination (ISC) agency.',
    phoneScript:
      '"I am calling to inquire about the disability-based Medicaid programs for children, specifically those where parental income is not considered, such as the Medically Fragile Technology Dependent Waiver or the Developmental Disabilities Waivers. Can you guide me on how to start the application process?"',
  },
  IN: {
    stateCode: 'IN',
    stateName: 'Indiana',
    programName: 'TEFRA Option (Katie Beckett-like)',
    programAcronym: 'TEFRA',
    requiredForm: 'Application for Developmental Disabilities Services (State Form 55068)',
    requiredFormNote:
      'This form is used to apply for services from the Bureau of Developmental Disabilities Services (BDDS) and helps counselors evaluate an individual\'s eligibility for services.',
    incomeRuleHeadline:
      'Parental income is excluded for children receiving Medicaid Waiver services in Indiana.',
    incomeRuleDetail:
      'Indiana\'s 1915(c) Home and Community-Based Services (HCBS) waivers waive parental income, allowing children with disabilities to qualify for Medicaid based on their own income and needs, rather than their parents\'. These waivers are open to children of all incomes.',
    applicationUrl: 'https://fssabenefits.in.gov/bp/#/',
    applicationPortalName: 'Benefits Portal',
    waiverPrograms: [
      {
        name: 'Community Integration and Habilitation Waiver',
        acronym: 'CIH Waiver',
        description: 'Provides services to individuals with intellectual and developmental disabilities to live in the community.',
      },
      {
        name: 'Family Supports Waiver',
        acronym: 'FSW',
        description: 'Provides limited, non-residential supports to individuals with developmental disabilities.',
      },
      {
        name: 'Health and Wellness Waiver',
        acronym: '',
        description: 'Provides services for individuals with disabilities (formerly the Aged and Disabled Waiver).',
      }
    ],
    medicaidPhone: '1-800-403-0864',
    stateTip:
      'Contact The Arc of Indiana for assistance from a family advocate, and confirm which waiver program is most appropriate for your child\'s specific needs, especially considering the recent split of the Aged and Disabled Waiver into the Health and Wellness Waiver and Pathways for Aging Waiver.',
    phoneScript:
      '"I am calling to inquire about applying for Medicaid for my child with a disability, specifically regarding programs that waive parental income, such as the TEFRA option or other Home and Community-Based Services waivers."',
  },
  KS: {
    stateCode: 'KS',
    stateName: 'Kansas',
    programName: 'Autism (AU) waiver',
    programAcronym: 'AU',
    requiredForm: 'Autism Application (English)',
    requiredFormNote:
      'This application collects basic information about the child and family, requires indicating autism screening tools used, and needs documentation of the autism diagnosis and a signature from a licensed medical doctor or Ph.D. psychologist.',
    incomeRuleHeadline:
      'Parental income is waived for eligibility in Kansas HCBS 1915(c) Medicaid waivers.',
    incomeRuleDetail:
      'Kansas HCBS 1915(c) Medicaid waivers, including the Autism waiver, waive parental income for eligibility. In the past, Kansas charged a parent fee, but now only a client obligation fee is assessed, which is $0 if the child has no or minimal income.',
    applicationUrl: 'https://www.dcfapp.kees.ks.gov/apspssp/ssp.portal',
    applicationPortalName: 'Medical Consumer Self-Service Portal',
    waiverPrograms: [
      {
        name: 'Autism (AU) waiver',
        acronym: 'AU',
        description: 'Provides support and training to parents of children with an Autism Spectrum Disorder (ASD) diagnosis to help ensure children with ASD can remain in their family home.',
      },
      {
        name: 'Intellectual / Developmental Disabilities (I/DD) waiver',
        acronym: 'I/DD',
        description: 'Provides home and community-based services for individuals with intellectual and developmental disabilities.',
      },
      {
        name: 'Physical Disability (PD) waiver',
        acronym: 'PD',
        description: 'Provides home and community-based services for individuals with physical disabilities.',
      }
    ],
    medicaidPhone: '1-800-792-4884',
    stateTip:
      'The Autism (AU) waiver services are limited to three years, with a possible one-year extension based on a review process and demonstrated need.',
    phoneScript:
      '"I am calling to inquire about applying for Medicaid for my child with a disability, specifically through a program that does not count parental income, such as the Autism waiver or a Katie Beckett-style program."',
  },
  KY: {
    stateCode: 'KY',
    stateName: 'Kentucky',
    programName: 'Community Health for Improved Lives and Development (CHILD) Waiver',
    programAcronym: 'CHILD Waiver',
    requiredForm: 'MAP 351A Form, Waiver Assessment',
    requiredFormNote:
      'This form is a Medicaid Waiver Assessment used to evaluate an individual\'s eligibility for waiver programs based on their disability and level of care needs. It is typically completed by a medical professional or a qualified assessor.',
    incomeRuleHeadline:
      'Parental income is excluded for the CHILD Waiver and other disability-based Medicaid waivers in Kentucky.',
    incomeRuleDetail:
      'For the Community Health for Improved Lives and Development (CHILD) Waiver, as well as the Michelle P. Waiver and Supports for Community Living Waiver, eligibility is based solely on the child\'s income. Parental income is not counted when determining financial eligibility for these programs.',
    applicationUrl: 'https://kynect.ky.gov/benefits/s/?language=en_US',
    applicationPortalName: 'Kynect Benefits',
    waiverPrograms: [
      {
        name: 'Michelle P. Waiver',
        acronym: 'MPW',
        description: 'Provides assistance to individuals with intellectual or developmental disabilities to help them live in the community as independently as possible.',
      },
      {
        name: 'Community Health for Improved Lives and Development Waiver',
        acronym: 'CHILD Waiver',
        description: 'Targets children with a psychiatric hospital or ICF/DD level of care, prioritizing those with complex needs.',
      },
      {
        name: 'Supports for Community Living Waiver',
        acronym: 'SCL',
        description: 'Provides services to children and adults with developmental or intellectual disabilities who meet an Intermediate Care Facility level of care.',
      }
    ],
    medicaidPhone: '1-855-306-8959',
    stateTip:
      'Kentucky has a significant waiting list for some waiver programs, particularly the Michelle P. Waiver and Supports for Community Living Waiver, with over 13,000 individuals waiting for services.',
    phoneScript:
      '"I am calling to inquire about applying for Medicaid for my child with a disability, specifically the Community Health for Improved Lives and Development (CHILD) Waiver. Can you guide me through the application process and explain the disability assessment requirements?"',
  },
  LA: {
    stateCode: 'LA',
    stateName: 'Louisiana',
    programName: 'Act 421 Children\'s Medicaid Option',
    programAcronym: '421-CMO or TEFRA',
    requiredForm: 'Medical review forms completed by your child\'s doctor',
    requiredFormNote:
      'A packet of forms, including medical review forms completed by your child\'s doctor, will be sent to you after the initial application. These forms are crucial for the Level of Care Review.',
    incomeRuleHeadline:
      'Parental income is excluded.',
    incomeRuleDetail:
      'The program is based on the child’s income only. The child must have an income at or below three (3) times the Federal Benefit Rate (FBR).',
    applicationUrl: 'https://sspweb.lameds.ldh.la.gov/',
    applicationPortalName: 'Medicaid Self-Service Portal',
    waiverPrograms: [
      {
        name: 'Children\'s Choice Waiver',
        acronym: 'CCW',
        description: 'Provides various home and community-based services for children with developmental or intellectual disabilities, including autism, who meet an ICF/IID level of care.',
      },
      {
        name: 'New Opportunities Waiver',
        acronym: 'NOW',
        description: 'Offers a comprehensive range of services for children and adults with developmental or intellectual disabilities, including autism, who meet an ICF/IID level of care.',
      },
      {
        name: 'Residential Options Waiver',
        acronym: 'ROW',
        description: 'Supports children and adults with developmental or intellectual disabilities, including autism, to transition from residential facilities to community living with various services.',
      }
    ],
    medicaidPhone: '1-800-230-0690',
    stateTip:
      'While the Children\'s Choice Waiver has not recently had a waiting list, be aware that there are over 14,000 people with intellectual and developmental disabilities on waiting lists for other programs in Louisiana.',
    phoneScript:
      '"I am calling to inquire about the Act 421 Children\'s Medicaid Option (TEFRA) for my child with a disability. Could you please guide me through the application process and explain the required forms?"',
  },
  MA: {
    stateCode: 'MA',
    stateName: 'Massachusetts',
    programName: 'Kaileigh Mulligan',
    programAcronym: 'TEFRA',
    requiredForm: '',
    requiredFormNote:
      '',
    incomeRuleHeadline:
      'Parental income is excluded.',
    incomeRuleDetail:
      'The Kaileigh Mulligan program is based on the child\'s income only. Parent income is not counted.',
    applicationUrl: 'https://www.mass.gov/how-to/apply-for-masshealth-the-health-safety-net-or-the-childrens-medical-security-plan',
    applicationPortalName: 'MA Login Account',
    waiverPrograms: [
      {
        name: 'Kaileigh Mulligan',
        acronym: 'TEFRA',
        description: 'Provides Medicaid coverage only, based on the child\'s income.',
      },
      {
        name: 'Children\'s Autism Spectrum Disorder Waiver',
        acronym: '',
        description: 'Provides community integration, expanded habilitation/education, homemaker, respite, assistive technology, behavioral supports and consultation, family training, home delivered meals, home modifications and adaptations, individual goods and services, and vehicle modification services to individuals with autism ages 0-9 years old who meet an ICF/IID level of care.',
      },
      {
        name: 'MassHealth CommonHealth',
        acronym: '',
        description: 'State-based and part of an 1115 waiver.',
      }
    ],
    medicaidPhone: '1-800-841-2900',
    stateTip:
      'There is no waiting list for the Kaileigh Mulligan program.',
    phoneScript:
      '"I am calling to inquire about the Kaileigh Mulligan intake process for my child."',
  },
  MD: {
    stateCode: 'MD',
    stateName: 'Maryland',
    programName: 'Medicaid Home and Community-Based Services Waiver for Children with Autism Spectrum Disorder',
    programAcronym: 'AW',
    requiredForm: 'Autism Waiver APPLICATION for a 1915(c) Home and Community-Based Services Waiver',
    requiredFormNote:
      'This is the application form required to apply for the Autism Waiver, which also involves meeting an ICF/IID level of care. This form is submitted to the Maryland State Department of Education or the Department of Health and Mental Hygiene.',
    incomeRuleHeadline:
      'Parental income is excluded for both the Model Waiver and the Autism Waiver.',
    incomeRuleDetail:
      'For both the Model Waiver and the Autism Waiver, financial eligibility is based on the child\'s income and assets only, with parental income not counted. The child\'s monthly income may not exceed 300% of SSI benefits, and countable assets may not exceed $2,000 or $2,500, depending on the eligibility category.',
    applicationUrl: 'https://www.marylandhealthconnection.gov/how-to-enroll/medicaid/',
    applicationPortalName: 'Maryland Health Connection',
    waiverPrograms: [
      {
        name: 'Model Waiver for Medically Fragile Children',
        acronym: 'MW',
        description: 'This waiver provides home and community-based services for medically fragile children who would otherwise require institutional care.',
      },
      {
        name: 'Waiver for Children with Autism Spectrum Disorder',
        acronym: 'AW',
        description: 'This waiver provides community-based therapeutic services and support to eligible children and youth with Autism Spectrum Disorder.',
      },
      {
        name: 'Community Pathways Waiver',
        acronym: '',
        description: 'This waiver provides home and community-based services for individuals with developmental disabilities, and as of October 2025, it rolled in the Family Supports Waiver and the Community Supports Waiver.',
      }
    ],
    medicaidPhone: '1-866-417-3480',
    stateTip:
      'The Autism Waiver currently has a waiting list. Families must contact the AW Registry at 1-866-417-3480 to be added to the waiting list when a vacancy occurs.',
    phoneScript:
      '"I am calling to inquire about applying for the Medicaid Home and Community-Based Services Waiver for Children with Autism Spectrum Disorder. Can you provide information on the application process and any required forms?"',
  },
  ME: {
    stateCode: 'ME',
    stateName: 'Maine',
    programName: 'Katie Beckett Program',
    programAcronym: 'KBM',
    requiredForm: 'MaineCare Disability Determination (PDF)',
    requiredFormNote:
      'This form is used to request a disability determination for MaineCare services and is completed by the Medical Review Team based on submitted medical documents.',
    incomeRuleHeadline:
      'Parental income is excluded for Katie Beckett program eligibility.',
    incomeRuleDetail:
      'The Katie Beckett program allows a child to qualify for MaineCare based on their own income and resources, disregarding parental income. The child must have a monthly income less than 300% of the Supplemental Security Income (SSI) and resources less than $2,000.',
    applicationUrl: 'https://www.mymaineconnection.gov',
    applicationPortalName: 'My Maine Connection',
    waiverPrograms: [
      {
        name: 'Section 21 Comprehensive Waiver',
        acronym: '',
        description: 'This waiver provides home and community-based services for individuals with Intellectual Disabilities or Autistic Disorders, offering an alternative to institutional care.',
      },
      {
        name: 'Section 29 Support Waiver',
        acronym: '',
        description: 'This waiver provides support services for adults with Intellectual Disabilities or Autistic Disorder who live with their families or on their own, including support in the workplace.',
      }
    ],
    medicaidPhone: '1-855-797-4357',
    stateTip:
      'When filling out the MaineCare application, be sure to state that the child has a disability. This should prompt the OFI eligibility specialist to screen for the Katie Beckett program if they do not qualify for MaineCare based on family size and income.',
    phoneScript:
      '"Hello, I am calling to inquire about applying for MaineCare for my child through the Katie Beckett program. My child has a disability, and I would like to understand the application process and what forms are required."',
  },
  MI: {
    stateCode: 'MI',
    stateName: 'Michigan',
    programName: 'Home Care Children\'s (HCC) / TEFRA Program',
    programAcronym: 'HCC / TEFRA',
    requiredForm: 'Demographic form, DHHS-49 form, 24-hr plan of care',
    requiredFormNote:
      'The Demographic form is a general information form. The DHHS-49 form must be completed by a pediatric provider to document the child\'s medical condition. The 24-hr plan of care is completed by the parent/guardian and lists the services, supplies, and supports the child needs.',
    incomeRuleHeadline:
      'Parental income is excluded for the Home Care Children\'s (HCC) / TEFRA Program.',
    incomeRuleDetail:
      'The Home Care Children\'s (HCC) / TEFRA Program in Michigan allows children with disabilities to qualify for Medicaid based on their own income and resources, without considering parental income. This is a crucial aspect for families who may not meet traditional Medicaid income thresholds but have a child with significant medical needs.',
    applicationUrl: 'https://www.michigan.gov/mdhhs/assistance-programs/medicaid/portalhome/beneficiaries/apply',
    applicationPortalName: 'MI Bridges',
    waiverPrograms: [
      {
        name: 'Children\'s Waiver Program',
        acronym: 'CWP',
        description: 'Provides Medicaid funded home and community-based services to children (under age 18) with documented developmental disabilities.',
      },
      {
        name: 'Waiver for Children with Serious Emotional Disturbances',
        acronym: 'SEDW',
        description: 'Enables Medicaid to fund necessary home and community-based services for children with serious emotional disturbance.',
      },
      {
        name: 'Habilitation Supports Waiver',
        acronym: 'HSW',
        description: 'Provides community-based services to people with intellectual or developmental disabilities.',
      }
    ],
    medicaidPhone: '1-800-642-3195',
    stateTip:
      'Ensure all required forms are completed in full and submitted together as PDF documents to avoid delays in processing the application for the HCC/TEFRA program.',
    phoneScript:
      '"I am calling to inquire about the Home Care Children\'s (HCC) / TEFRA Program for my child with a disability. Can you provide information on how to start the application process and what forms are needed?"',
  },
  MN: {
    stateCode: 'MN',
    stateName: 'Minnesota',
    programName: 'Medical Assistance under the TEFRA option for children with disabilities',
    programAcronym: 'TEFRA',
    requiredForm: 'Application for Health Coverage and Help Paying Costs (DHS-6696)',
    requiredFormNote:
      'This form is used to apply for Medical Assistance. If a child is denied due to income, the county or tribal office may request more information for the TEFRA option and refer to SMRT for disability determination.',
    incomeRuleHeadline:
      'Parental income is excluded for the TEFRA option.',
    incomeRuleDetail:
      'The TEFRA option helps children with disabilities qualify for Medical Assistance (MA) by only counting the child\'s income, not the whole family\'s income. If a child is denied MA due to family income, the TEFRA option can be pursued.',
    applicationUrl: 'https://www.mnsure.org/new-customers/apply/index.jsp',
    applicationPortalName: 'MNsure',
    waiverPrograms: [
      {
        name: 'Developmental Disabilities Waiver',
        acronym: 'DD Waiver',
        description: 'Provides funding for home and community-based services for children and adults with a diagnosis of a developmental disability.',
      },
      {
        name: 'Community Alternative Care Waiver',
        acronym: 'CAC Waiver',
        description: 'Provides home and community-based services to children and adults who are chronically ill or medically fragile.',
      },
      {
        name: 'Community Access for Disability Inclusion Waiver',
        acronym: 'CADI Waiver',
        description: 'Provides home and community-based services to children and adults with disabilities who would otherwise require the level of care provided in a nursing facility.',
      }
    ],
    medicaidPhone: '1-800-657-3739',
    stateTip:
      'Minnesota eliminated its Developmental Disabilities (DD) waiver waitlist in 2016 and has maintained that status through strong county-based service coordination.',
    phoneScript:
      '"I am calling to inquire about applying for Medical Assistance under the TEFRA option for my child with a disability. Can you guide me through the process and explain the required forms?"',
  },
  MO: {
    stateCode: 'MO',
    stateName: 'Missouri',
    programName: 'Missouri Children with Developmental Disabilities (MOCDD) Waiver',
    programAcronym: 'MOCDD',
    requiredForm: 'Functional Assessment and Supporting Documentation',
    requiredFormNote:
      'Eligibility is determined by a functional assessment. Parents should bring diagnostic reports, psychological evaluations, school evaluations, and adaptive behavior scores (like Vineland or ABAS) to their Regional Office intake.',
    incomeRuleHeadline:
      'Parental income is excluded for the MOCDD Waiver, which functions similarly to a Katie Beckett program.',
    incomeRuleDetail:
      'Missouri does not run a traditional Katie Beckett TEFRA program. However, some children qualify through the MOCDD Waiver, which bases eligibility on the child\'s needs rather than parental income. There is also a limited MO HealthNet disability pathway under the state plan for children meeting institutional level of care criteria.',
    applicationUrl: 'https://mydss.mo.gov',
    applicationPortalName: 'MO HealthNet',
    waiverPrograms: [
      {
        name: 'Missouri Autism Waiver',
        acronym: '',
        description: 'Missouri is one of only a handful of states with a dedicated, autism-specific Medicaid waiver, and the Missouri Autism Waiver delivers intensive services to autistic children, including in-home respite, behavioral analysis services, and other autism-focused supports.',
      },
      {
        name: 'Missouri Children with Developmental Disabilities (MOCDD) Waiver',
        acronym: 'MOCDD',
        description: 'A children-focused waiver designed to keep kids at home with their families. Funds behavioral services, respite, personal assistant services, and assistive technology. For some Missouri families, MOCDD is the most accessible path because it has functional eligibility criteria similar to Katie Beckett.',
      },
      {
        name: 'Missouri Comprehensive Waiver',
        acronym: '',
        description: 'The most extensive Missouri waiver for adults with intellectual disability or developmental disabilities including autism. Funds residential supports, day services, supported employment, behavioral services, respite, and a wide range of adult supports.',
      }
    ],
    medicaidPhone: '1-855-373-4636',
    stateTip:
      'Missouri is a 209(b) state, meaning SSI approval does not automatically enroll your child in MO HealthNet; a separate Medicaid application must be filed the same day as the SSI application.',
    phoneScript:
      '"I am calling to inquire about applying for disability-based Medicaid for my child, specifically the MOCDD Waiver, and to schedule an intake with the Regional DD Office."',
  },
  MS: {
    stateCode: 'MS',
    stateName: 'Mississippi',
    programName: 'Katie Beckett Program',
    programAcronym: 'KBP',
    requiredForm: 'Katie Beckett Program (formerly DCLH) Medical Necessity and Level of Care form',
    requiredFormNote:
      'This form should be completed and included with the Medicaid application packet for Katie Beckett Program (KBP) coverage. The physician and the parents and/or caregiver can coordinate to complete this form with as much detail as possible. The form must be signed and dated by a physician.',
    incomeRuleHeadline:
      'Parental income is excluded for the Katie Beckett Program.',
    incomeRuleDetail:
      'The Katie Beckett Program is based on the child\'s income only. Parental income is not counted towards eligibility. The child must not have income or assets in their name exceeding current standards for an individual in long-term care.',
    applicationUrl: 'www.access.ms.gov',
    applicationPortalName: 'Mississippi Medicaid common web portal',
    waiverPrograms: [
      {
        name: 'Intellectual Disabilities and Developmental Disabilities Waiver',
        acronym: 'ID/DD Waiver',
        description: 'Provides day services, in-home respite, prevocational services, supervised living, support coordination, supported employment, supported living, specialized medical supplies, therapy services, behavior support services, community respite, crisis intervention, crisis support, home and community supports, host home, in-home nursing respite, job discovery, shared supported living, and transition assistance services to individuals with autism, intellectual disabilities, or developmental disabilities ages 0 or older who meet an ICF/IID level of care.',
      },
      {
        name: 'Independent Living Waiver',
        acronym: 'IL Waiver',
        description: 'Provides personal care attendant, environmental accessibility adaptations, specialized medical equipment and supplies, and transition assistance services to individuals ages 65 or older, and individuals with physical or other disabilities ages 16-64 years who meet a nursing facility level of care.',
      },
      {
        name: 'Traumatic Brain Injury and Spinal Cord Injury Waiver',
        acronym: 'TBI/SCI Waiver',
        description: 'Provides personal care attendant, respite, environmental accessibility adaptations, specialized medical equipment and supplies, and transition assistance services to individuals with physical disabilities or brain injury ages 0 or older who meet a nursing facility level of care.',
      }
    ],
    medicaidPhone: '1-800-421-2408',
    stateTip:
      'Mississippi has a waiting list for its ID/DD Waiver, with 2496 people with developmental disabilities on it. It is important to apply early.',
    phoneScript:
      '"I am calling to inquire about applying for the Katie Beckett Program for my child with a disability. Can you guide me through the application process and provide the necessary forms?"',
  },
  MT: {
    stateCode: 'MT',
    stateName: 'Montana',
    programName: 'Developmental Disabilities Program (DDP) Comprehensive Waiver',
    programAcronym: 'DDP',
    requiredForm: 'Eligibility Determination Form - Children',
    requiredFormNote:
      'This form is used to determine a child\'s eligibility for services through the Developmental Disabilities Program. It is typically completed by the child\'s parents or legal guardians.',
    incomeRuleHeadline:
      'Parental income is excluded for the disability-based waiver program.',
    incomeRuleDetail:
      'For the Comprehensive Waiver (0208), parental income is not counted. Eligibility is based solely on the child\'s income, treating the child as a household of one, which allows children to qualify for Medicaid regardless of their parents\' income.',
    applicationUrl: 'https://apply.mt.gov/',
    applicationPortalName: 'Montana DPHHS online application',
    waiverPrograms: [
      {
        name: 'Home and Community-Based Waiver for Individuals with Developmental Disabilities',
        acronym: '0208 Comprehensive Waiver',
        description: 'This waiver provides a range of home and community-based services to individuals with intellectual or developmental disabilities who meet an ICF/IID level of care.',
      }
    ],
    medicaidPhone: '1-406-444-2995',
    stateTip:
      'Be aware that Montana has a significant waiting list for the Developmental Disabilities Waiver, with 2095 individuals currently awaiting services.',
    phoneScript:
      '"I am calling to inquire about the application process for the Developmental Disabilities Program (DDP) Comprehensive Waiver for my child with a developmental disability."',
  },
  NC: {
    stateCode: 'NC',
    stateName: 'North Carolina',
    programName: 'Community Alternatives Program for Children',
    programAcronym: 'CAP/C',
    requiredForm: 'DMA-3163, CAP/C Referral Form',
    requiredFormNote:
      'This form is used to refer a child for the CAP/C waiver program. It gathers recipient identifying information, caregiver details, legal guardianship, and primary care physician information. It can be submitted by contacting a local CAP/C case management entity or by faxing the completed form.',
    incomeRuleHeadline:
      'Parental income is excluded for both the CAP/C and NC Innovations waivers.',
    incomeRuleDetail:
      'The Community Alternatives Program for Children (CAP/C) and the NC Innovations Waiver are Home and Community-based Services (HCBS) programs. Eligibility for these waivers is based on the child\'s medical or developmental needs and their risk of institutionalization, not on parental income. This allows children to receive necessary services regardless of their family\'s financial situation.',
    applicationUrl: 'https://epass.nc.gov/',
    applicationPortalName: 'ePASS',
    waiverPrograms: [
      {
        name: 'NC Innovations Waiver',
        acronym: 'NC Innovations',
        description: 'This waiver covers a wide range of services for children and adults with intellectual or developmental disabilities (I/DD), including autism, cerebral palsy, and Down syndrome. It provides home and community-based services and waives parental income.',
      },
      {
        name: 'Community Alternatives Program for Children',
        acronym: 'CAP/C',
        description: 'This waiver provides home and community-based services as a cost-effective alternative to institutionalization for medically fragile and medically complex children aged 0-20.',
      }
    ],
    medicaidPhone: '1-888-245-0179',
    stateTip:
      'For the NC Innovations Waiver, join the waitlist as soon as possible, even if services are not immediately needed, as the wait can be long.',
    phoneScript:
      '"I am calling to inquire about the disability-based Medicaid program for my child with developmental disabilities, specifically the Community Alternatives Program for Children (CAP/C) or the NC Innovations Waiver. Can you guide me on how to start the application process and what forms are required?"',
  },
  ND: {
    stateCode: 'ND',
    stateName: 'North Dakota',
    programName: 'North Dakota does not have a Katie Beckett or TEFRA program. Children with disabilities may be eligible through other Medicaid pathways or waivers.',
    programAcronym: '',
    requiredForm: 'SFN 60618',
    requiredFormNote:
      'SFN 60618 is the application form for the North Dakota Autism Waiver. It requires a copy of the diagnosis from the professional who made the diagnosis of Autism Spectrum Disorder.',
    incomeRuleHeadline:
      'Parental income is not excluded for disability-based Medicaid pathways in North Dakota.',
    incomeRuleDetail:
      'North Dakota does not have a Katie Beckett or TEFRA program. For other Medicaid programs, income and asset limits apply. For children with disabilities, parental income is not disregarded for the Autism Spectrum Disorder Waiver or the Traditional Individual with Intellectual Disabilities and Developmental Disabilities Home and Community-Based Services Waiver.',
    applicationUrl: 'https://www.hhs.nd.gov/applyforhelp',
    applicationPortalName: 'Self-Service Portal',
    waiverPrograms: [
      {
        name: 'Autism Spectrum Disorder Birth through Age 20 Waiver',
        acronym: 'ASD Waiver',
        description: 'This waiver provides services for children diagnosed with Autism Spectrum Disorder from birth through age 20 to receive home and community-based services.',
      },
      {
        name: 'Traditional Individual with Intellectual Disabilities and Developmental Disabilities Home and Community-Based Services Waiver',
        acronym: 'ID/DD Waiver',
        description: 'This waiver provides home and community-based services for individuals with intellectual and developmental disabilities.',
      }
    ],
    medicaidPhone: '1-701-328-7068',
    stateTip:
      'North Dakota does not offer a Katie Beckett or TEFRA program. Families should explore the Autism Spectrum Disorder Waiver or the Traditional Individual with Intellectual Disabilities and Developmental Disabilities Home and Community-Based Services Waiver for children with disabilities.',
    phoneScript:
      '"Hello, I am calling to inquire about Medicaid programs for children with disabilities in North Dakota, specifically the Autism Spectrum Disorder Waiver or the Traditional Individual with Intellectual Disabilities and Developmental Disabilities Home and Community-Based Services Waiver. Can you provide information on eligibility and the application process?"',
  },
  NE: {
    stateCode: 'NE',
    stateName: 'Nebraska',
    programName: 'Katie Beckett Program',
    programAcronym: 'TEFRA',
    requiredForm: 'Assessment by DHHS Pediatric Nurse Consultant',
    requiredFormNote:
      'A DHHS Pediatric Nurse Consultant will assess the child to determine if they qualify for the Katie Beckett program.',
    incomeRuleHeadline:
      'Parental income is excluded for the Katie Beckett Program.',
    incomeRuleDetail:
      'Only the child\'s income and resources are used to determine Medicaid eligibility for children served by the Katie Beckett program. Parental income is not counted.',
    applicationUrl: 'https://iserve.nebraska.gov/apply/start',
    applicationPortalName: 'iServe Nebraska',
    waiverPrograms: [
      {
        name: 'Katie Beckett Program',
        acronym: '',
        description: 'Provides Medicaid coverage only.',
      },
      {
        name: 'Family Support Waiver',
        acronym: '',
        description: 'Provides Respite, Assistive Technology, Child Day Habilitation, Community Integration, Day Supports, Environmental Modification Assessment Family and Peer Mentoring, Family Caregiver Training, Home Modifications, Homemaker, Independent Living, Non-Medical Transportation, Personal Emergency Response System (PERS) Supported Family Living, and Vehicle Modifications for children ages 0-21 with intellectual disabilities, developmental disabilities, or autism.',
      },
      {
        name: 'Comprehensive Developmental Disabilities Services Waiver',
        acronym: '',
        description: 'Provides prevocational, residential habilitation, respite, supported employment – individual, adult day, assistive technology, behavioral in-home habilitation, child day habilitation, community integration, consultative assessment, day supports, environmental modification assessment, home modifications, homemaker, independent living, medical in-home habilitation, personal emergency response system (PERS), small group vocational support, supported employment – follow along, supported family living, therapeutic residential habilitation, transitional services, transportation, and vehicle modifications for individuals with autism, intellectual disabilities, and developmental disabilities, ages 0 to no max age.',
      }
    ],
    medicaidPhone: '1-855-632-7633',
    stateTip:
      'Be aware that there is a waiting list of 2754 people for developmental disabilities waivers in Nebraska.',
    phoneScript:
      '"I am calling to apply for Medicaid for my child with a disability and would like to request an assessment for the Katie Beckett Program."',
  },
  NH: {
    stateCode: 'NH',
    stateName: 'New Hampshire',
    programName: 'Home Care for Children with Severe Disabilities (HC-CSD)',
    programAcronym: 'HC-CSD',
    requiredForm: 'Home Care for Children with Severe Disabilities (HC-CSD) Family Information Report - 968',
    requiredFormNote:
      'If you are the parent or guardian of a child with severe disabilities, and are applying for HC-CSD, you must complete this form to provide DHHS with information about your family and the child\'s disability.',
    incomeRuleHeadline:
      'Parental income is excluded for the Home Care for Children with Severe Disabilities (HC-CSD) program.',
    incomeRuleDetail:
      'New Hampshire currently has a TEFRA-like program and two HCBS 1915(c) waivers that serve children. All three programs waive parent income. The Home Care for Children with Severe Disabilities (HC-CSD) program provides Medicaid coverage only, based on the child\'s disability, not family income.',
    applicationUrl: 'https://nheasy.nh.gov/#/',
    applicationPortalName: 'NH EASY - Gateway to Services',
    waiverPrograms: [
      {
        name: 'Home Care for Children with Severe Disabilities',
        acronym: 'HC-CSD',
        description: 'Provides Medicaid coverage only based on the child\'s disability.',
      },
      {
        name: 'Developmental Disabilities Waiver',
        acronym: '',
        description: 'Provides community participation, residential habilitation, respite, and other services for individuals with autism, intellectual disabilities, and developmental disabilities.',
      },
      {
        name: 'In-Home Supports for Children with Developmental Disabilities',
        acronym: '',
        description: 'Provides in-home residential habilitation, service coordination, assistive technology, and respite care services for individuals with autism, ID, DD, ages 0-21.',
      }
    ],
    medicaidPhone: '1-844-275-3447',
    stateTip:
      'For the Developmental Disabilities Waiver and In-Home Supports for Children with Developmental Disabilities, contact the Bureau of Developmental Services (BDS) at 603-271-5034 to apply.',
    phoneScript:
      '"I am calling to apply for the Home Care for Children with Severe Disabilities (HC-CSD) program, also known as the Katie Beckett option, for my child with a disability."',
  },
  NJ: {
    stateCode: 'NJ',
    stateName: 'New Jersey',
    programName: 'Managed Long Term Services and Supports (MLTSS) and Split Application Medicaid',
    programAcronym: 'MLTSS',
    requiredForm: 'Application for Determination of Eligibility (FULL or SHORT) / Pediatric Clinical Eligibility Assessment',
    requiredFormNote:
      'The Application for Determination of Eligibility is used by the Division of Developmental Disabilities (DDD) to assess functional eligibility for services. For MLTSS, a Pediatric Clinical Eligibility Assessment is conducted by the Managed Care Organizations (MCOs) to determine if the child meets the nursing home level of care.',
    incomeRuleHeadline:
      'Parental income is excluded for specific disability-based Medicaid pathways for children.',
    incomeRuleDetail:
      'For children applying for the Managed Long Term Services and Supports (MLTSS) program who meet Pediatric Clinical Eligibility, parental income and resources are not counted in determining financial eligibility. Additionally, a \'Split Application Medicaid\' method allows children with disabilities to access Medicaid regardless of parental income when they have a non-disabled sibling.',
    applicationUrl: 'https://njfamilycare.dhs.state.nj.us/apply.aspx',
    applicationPortalName: 'NJ FamilyCare',
    waiverPrograms: [
      {
        name: 'Medicaid Managed Long Term Services and Supports',
        acronym: 'MLTSS',
        description: 'Provides comprehensive services and supports for individuals who meet a nursing home level of care, with parental income not counted for eligible children.',
      }
    ],
    medicaidPhone: '1-800-701-0710',
    stateTip:
      'New Jersey has a waiting list for some waiver programs; it is advisable to apply early and contact the Division of Disabilities Services (DDS) for guidance on specific programs for children.',
    phoneScript:
      '"I am calling to inquire about Medicaid options for my child with a disability, specifically programs that do not count parental income, such as the Managed Long Term Services and Supports (MLTSS) program or the Split Application Medicaid method."',
  },
  NM: {
    stateCode: 'NM',
    stateName: 'New Mexico',
    programName: 'Medically Fragile Waiver',
    programAcronym: '',
    requiredForm: 'HCBS Waivers & ICF/IID Application Form',
    requiredFormNote:
      'This form is used to apply for Home and Community-Based Services (HCBS) waivers and for Intermediate Care Facilities for Individuals with Intellectual Disabilities (ICF/IID). It is completed by the applicant or their legal guardian.',
    incomeRuleHeadline:
      'Parental income is excluded for disability-based Medicaid waivers in New Mexico.',
    incomeRuleDetail:
      'For the Medically Fragile Waiver and Developmental Disabilities Waiver Program, eligibility is based solely on the child\'s income, and parental income is not considered. This allows children with significant disabilities to qualify for Medicaid services regardless of their family\'s financial status. For the Mi Via waiver, parental income is also disregarded.',
    applicationUrl: 'https://www.yes.nm.gov/',
    applicationPortalName: 'YES.NM.GOV',
    waiverPrograms: [
      {
        name: 'Medically Fragile Waiver',
        acronym: '',
        description: 'Provides case management, customized community group supports, home health aide, respite, nutritional counseling, skilled therapy, and various other services for individuals who are medically fragile, ages 0 – no max age.',
      },
      {
        name: 'Developmental Disabilities Waiver Program',
        acronym: 'DD Waiver',
        description: 'Provides case management, community integrated employment, customized community supports, living supports, respite, and various therapies for individuals with intellectual and developmental disabilities, ages 0 – no max age.',
      },
      {
        name: 'Mi Via Self-Directed Waiver',
        acronym: 'Mi Via',
        description: 'A self-directed Home and Community-Based Services (HCBS) program designed to help individuals with Intellectual and Developmental Disabilities (IDD) or Medically Fragile conditions manage their own services and supports.',
      }
    ],
    medicaidPhone: '1-800-283-4465',
    stateTip:
      'New Mexico has a significant waiting list for its Developmental Disabilities Waiver Program, with over 16,000 individuals awaiting services. Early application is crucial.',
    phoneScript:
      '"I am calling to inquire about applying for Medicaid for my child with a disability, specifically a Katie Beckett-style waiver or a waiver that disregards parental income."',
  },
  NV: {
    stateCode: 'NV',
    stateName: 'Nevada',
    programName: 'The Katie Beckett Eligibility Option',
    programAcronym: 'TEFRA',
    requiredForm: 'Form 2920 - Application for Assistance (MAABD)',
    requiredFormNote:
      'This form is the Application for Assistance for Medical Assistance to the Aged, Blind, and Disabled (MAABD) program, which is required when applying for Medicaid under the Katie Beckett Eligibility Option. It should be filled out as if the child is applying for SSI and Medicaid.',
    incomeRuleHeadline:
      'Parental income and resources are waived for children under 19 years old who have a disability and meet a level of care that would make them eligible for institutional placement.',
    incomeRuleDetail:
      'The Katie Beckett Eligibility Option allows a State to waive parental income and resources for any child under 19 years old who has a disability and meets a level of care that would make the child eligible for placement in a hospital, nursing facility, or Intermediate Care Facility for persons with intellectual disabilities (ICF/ID). There may be a parental financial responsibility based on the parent’s income and resources for those children qualifying under the Katie Beckett Eligibility Option. The amount of money that the parents would be required to pay is determined by the Nevada State Welfare Division and is based on a sliding fee schedule. If your family qualifies for parental financial responsibility, this applies on a monthly basis regardless if services were accessed or not.',
    applicationUrl: 'https://accessnevada.nv.gov/',
    applicationPortalName: 'Access Nevada',
    waiverPrograms: [
      {
        name: 'HCBS Waiver for Persons with Physical Disabilities',
        acronym: '',
        description: 'This waiver provides services that allow individuals who have a significant physical disability to receive care in their home and community.',
      },
      {
        name: 'HCBS Waiver for Individuals with Intellectual and Developmental Disabilities',
        acronym: '',
        description: 'This waiver provides home and community-based services for individuals with intellectual and developmental disabilities.',
      },
      {
        name: 'Waiver for Structured Family Caregiving',
        acronym: '',
        description: 'This waiver provides support for family caregivers who provide care to eligible individuals in their home.',
      }
    ],
    medicaidPhone: '1-775-684-0800',
    stateTip:
      'Nevada previously charged a family fee or “parental reimbursement” for families who earn more than 200% of the federal poverty level, but as of 2019, there was a moratorium on collection of these fees.',
    phoneScript:
      '"I am calling to apply for Medicaid under the Katie Beckett Eligibility Option for my child with a disability. Can you guide me through the application process and let me know what forms, specifically the MAABD portion, I need to complete?"',
  },
  NY: {
    stateCode: 'NY',
    stateName: 'New York',
    programName: 'Home and Community Based Services (HCBS) Waiver',
    programAcronym: 'HCBS Waiver',
    requiredForm: 'Application for Participation',
    requiredFormNote:
      'This form is used to apply for enrollment in the OPWDD Home and Community Based Services Waiver. It gathers information about the individual\'s developmental disability and need for services.',
    incomeRuleHeadline:
      'Parental income and resources are excluded for eligibility in New York\'s disability-based Medicaid waiver programs for children.',
    incomeRuleDetail:
      'For the Home and Community Based Services (HCBS) Waiver and the Care at Home Waiver, eligibility is determined by disregarding parental income and resources. This means that children who would not qualify for Medicaid under standard rules due to their parents\' income can still be eligible for these specific programs.',
    applicationUrl: 'https://nystateofhealth.ny.gov/',
    applicationPortalName: 'NY State of Health',
    waiverPrograms: [
      {
        name: 'Home and Community Based Services (HCBS) Waiver',
        acronym: 'HCBS Waiver',
        description: 'This waiver funds various services to support individuals with intellectual and developmental disabilities in their homes and communities, allowing them to avoid institutionalization.',
      },
      {
        name: 'Care at Home Medicaid Waiver for Developmentally Disabled Children',
        acronym: 'CAHWP',
        description: 'This program provides medical assistance and services like case management, respite, and home adaptations for children under 18 with severe developmental disabilities who have complex health care needs.',
      },
      {
        name: 'Children\'s Waiver',
        acronym: '',
        description: 'New York has a Children\'s Waiver that serves children with serious emotional disturbance, medically fragile conditions, and developmental disabilities, providing home and community-based services.',
      }
    ],
    medicaidPhone: '1-800-541-2831',
    stateTip:
      'Contact your regional OPWDD Front Door Office as the first step to access supports and services, including the HCBS Waiver. They can guide you through the eligibility determination process.',
    phoneScript:
      '"I am calling to inquire about Medicaid programs for my child with a developmental disability, specifically the Home and Community Based Services Waiver, where parental income is not counted for eligibility."',
  },
  OH: {
    stateCode: 'OH',
    stateName: 'Ohio',
    programName: 'Ohio Home and Community-Based Services (HCBS) Waivers for Children with Disabilities',
    programAcronym: '',
    requiredForm: 'ODM 02399 "Request for Medicaid Home and Community-Based Services (HCBS) Waiver"',
    requiredFormNote:
      'This form is used to request enrollment in Ohio\'s HCBS waiver programs and is submitted to the County Department of Job and Family Services.',
    incomeRuleHeadline:
      'Parental income is not counted for eligibility in several of Ohio\'s Home and Community-Based Services (HCBS) waiver programs for children with disabilities.',
    incomeRuleDetail:
      'For the Home Care, Individual Options, and Level One waivers, eligibility is based solely on the child\'s income, and parental income is not considered. This allows children with disabilities to qualify for Medicaid services regardless of their family\'s financial situation.',
    applicationUrl: 'https://ssp.benefits.ohio.gov/',
    applicationPortalName: 'Ohio Benefits Self-Service Portal',
    waiverPrograms: [
      {
        name: 'Individual Options Waiver',
        acronym: 'IO',
        description: 'Provides comprehensive services for individuals with developmental or intellectual disabilities who require an intermediate care facility level of care but wish to live at home.',
      },
      {
        name: 'Level One Waiver',
        acronym: '',
        description: 'Provides services for individuals with developmental or intellectual disabilities who do not require extensive paid support staff.',
      },
      {
        name: 'Home Care Waiver',
        acronym: '',
        description: 'Provides services for children and adults with physical or other health disabilities who meet a nursing facility or hospital level of care.',
      }
    ],
    medicaidPhone: '1-800-324-8680',
    stateTip:
      'Ohio has a waiting list for developmental disabilities waivers, so it is important to apply early and contact your County Board for Developmental Disabilities for assistance.',
    phoneScript:
      '"I am calling to inquire about applying for Medicaid Home and Community-Based Services (HCBS) waivers for my child with a disability, specifically programs where parental income is not counted for eligibility."',
  },
  OK: {
    stateCode: 'OK',
    stateName: 'Oklahoma',
    programName: 'TEFRA (Tax Equity and Fiscal Responsibility Act of 1982) Children Overview',
    programAcronym: 'TEFRA',
    requiredForm: 'TEFRA Financial Application Form 08OA002E-002, Assessment form (TEFRA-1 for families)',
    requiredFormNote:
      'The TEFRA Financial Application Form 08OA002E-002 needs to be completed. The Assessment form (TEFRA-1 for families) is also required and available in English and Spanish.',
    incomeRuleHeadline:
      'Parental income and resources are excluded for TEFRA eligibility.',
    incomeRuleDetail:
      'TEFRA (Tax Equity and Fiscal Responsibility Act of 1982) allows Medicaid (SoonerCare in Oklahoma) benefits for children with physical or mental disabilities who would not typically qualify for Supplemental Security Income (SSI) due to their parents\' income or resources. This enables children eligible for institutional services to receive care at home.',
    applicationUrl: 'https://www.apply.okhca.org/Site/UserAccountLogin.aspx',
    applicationPortalName: 'OHCA Member Enrollment',
    waiverPrograms: [
      {
        name: 'Community Waiver',
        acronym: '',
        description: 'Provides adult day health, habilitation training specialist services, homemaker, prevocational services, respite, supported employment, nursing, prescribed drugs, agency companion, audiology services, community transition services, daily living supports, dental services, environmental accessibility adaptations and architectural modification, extended duty nursing, family counseling, family training, group home, intensive personal support, nutrition services, occupational therapy services, physical therapy services, psychological services, remote support, respite daily, self-directed goods and services (SD-GS), specialized foster care also known as specialized family home/care, specialized medical supplies and assistive technology, speech therapy services, and transportation for individuals with intellectual disabilities, ages 3 – no max age.',
      },
      {
        name: 'In-Home Supports Waiver for Children',
        acronym: 'IHSW-C',
        description: 'Provides Habilitation Training Specialist Services, Prevocational Services, Respite, Supported Employment, Environmental Accessibility Adaptations and Architectural Modification, Family Training, Occupational and Physical Therapy, Respite Daily, Self Directed Goods and Services (SD-GS), and Specialized Medical Supplies and Assistive Technology for individuals with IID, ages 3-17.',
      }
    ],
    medicaidPhone: '1-405-522-7752',
    stateTip:
      'Oklahoma is actively working to reduce waiver waiting lists, aiming to become a no-wait state for developmental disability services.',
    phoneScript:
      '"I am calling to request a TEFRA application packet for my child with disabilities."',
  },
  OR: {
    stateCode: 'OR',
    stateName: 'Oregon',
    programName: 'Children\'s Intensive In-Home Services (CIIS)',
    programAcronym: 'CIIS',
    requiredForm: 'Medically Involved Children’s Program Referral Form (SDS 4538)',
    requiredFormNote:
      'This form is used to refer a child to the Children’s Intensive In-Home Services (CIIS) program. It can be completed by a parent or family member, or other referral sources, and requires information about the child\'s medical issues, care needs, and current services received. A current DD eligibility statement and recent medical/therapeutic assessments should be attached.',
    incomeRuleHeadline:
      'Parental income is excluded for eligibility in Oregon\'s CIIS program.',
    incomeRuleDetail:
      'Oregon\'s CIIS program is described as their version of the Katie Beckett waiver, which typically allows children to qualify for Medicaid based on their own income and assets, disregarding parental income. This allows children with significant disabilities to access home-based medical services.',
    applicationUrl: 'http://www.oregon.gov/dhs/DD/pages/children/in-home.aspx',
    applicationPortalName: 'Oregon Department of Human Services (DHS) - Developmental Disabilities (DD) Services',
    waiverPrograms: [
      {
        name: 'Medically Fragile Program',
        acronym: '',
        description: 'For children who are technology-dependent, with no waiting list.',
      },
      {
        name: 'Medically Involved Program',
        acronym: '',
        description: 'May have a waiting list, requires referral from a case manager from the Community Developmental Disabilities Program.',
      },
      {
        name: 'Behavior Program',
        acronym: '',
        description: 'For children with intensive behavioral needs, may have a waiting list, requires referral from a case manager from the Community Developmental Disabilities Program.',
      }
    ],
    medicaidPhone: '1-800-699-9075',
    stateTip:
      'Be aware that there may be waiting lists for the Medically Involved and Behavior Programs, and it is advisable to contact the CIIS program before moving to Oregon.',
    phoneScript:
      '"I am calling to inquire about the Children\'s Intensive In-Home Services (CIIS) program, Oregon\'s version of the Katie Beckett waiver, for my child with a disability. Can you guide me through the application process?"',
  },
  PA: {
    stateCode: 'PA',
    stateName: 'Pennsylvania',
    programName: 'Medicaid for Children with Special Needs',
    programAcronym: 'PH95',
    requiredForm: 'Physician Certification for Child with Special Needs Form (PA 1960) and documentation of Social Security childhood disability standards',
    requiredFormNote:
      'This form, along with documentation of the child meeting Social Security childhood disability standards, is required to establish the child\'s disability for PH-95 eligibility. Parents are responsible for assembling documentation of the child\'s disability or condition.',
    incomeRuleHeadline:
      'Parental income is excluded for PH-95 Medicaid eligibility.',
    incomeRuleDetail:
      'Parental income and assets are not counted for PH-95 eligibility. However, the child\'s own countable income must be at or below 100% of the Federal Poverty Income Guidelines. Court-ordered child support and certain Social Security benefits received by the child are excluded from this calculation.',
    applicationUrl: 'https://www.compass.state.pa.us',
    applicationPortalName: 'COMPASS',
    waiverPrograms: [
      {
        name: 'Consolidated Waiver',
        acronym: '',
        description: 'Supports individuals with an intellectual disability, autism or developmental disability to live more independently.',
      },
      {
        name: 'Community Living Waiver',
        acronym: '',
        description: 'Supports individuals with an intellectual disability, autism or developmental disability to live more independently in their communities.',
      },
      {
        name: 'Adult Autism Waiver',
        acronym: '',
        description: 'Provides services and supports to eligible adults with autism spectrum disorder to promote community living.',
      }
    ],
    medicaidPhone: '1-866-550-4355',
    stateTip:
      'Even though parental income is not counted for PH-95 eligibility, parents will still be required to submit proof of their income to the County Assistance Office.',
    phoneScript:
      '"I am calling to apply for Medicaid for my child under the PH-95 category for children with disabilities. Can you guide me through the application process and what documentation is needed to establish disability?"',
  },
  RI: {
    stateCode: 'RI',
    stateName: 'Rhode Island',
    programName: 'Katie Beckett Medicaid',
    programAcronym: 'KB',
    requiredForm: 'DHS-2 Application, Katie Beckett (KB) AP 72.1—Clinical Evaluation for Katie Beckett Coverage Group',
    requiredFormNote:
      'The DHS-2 Application is a general Medicaid application completed by a parent or guardian. The Katie Beckett (KB) AP 72.1—Clinical Evaluation form is required to support the clinical evaluation for the Katie Beckett Program and is typically completed by medical professionals.',
    incomeRuleHeadline:
      'Parental income is excluded for Katie Beckett eligibility.',
    incomeRuleDetail:
      'Katie Beckett is an eligibility category in Medicaid that allows certain children under age 19 who have long-term disabilities or complex medical needs to become eligible for Medicaid coverage. With Katie Beckett, only the child\'s income and resources are used to determine eligibility, enabling children to be cared for at home instead of an institution.',
    applicationUrl: 'https://eohhs.ri.gov/Consumer/ConsumerInformation/Applications.aspx',
    applicationPortalName: 'DHS/State of Rhode Island',
    waiverPrograms: [
      {
        name: 'Katie Beckett Program',
        acronym: 'KB',
        description: 'Provides Medicaid coverage only for children with disabilities who would otherwise require institutional care, based solely on the child\'s income.',
      },
      {
        name: 'Rhode Island Comprehensive Demonstration',
        acronym: '',
        description: 'A Medicaid replacement program that provides home and community-based services for all ages, including additional services for children with disabilities or chronic conditions, accessed via TEFRA eligibility.',
      }
    ],
    medicaidPhone: '1-855-697-4347',
    stateTip:
      'Rhode Island has 164 uncategorized individuals on interest/referral lists for the Comprehensive Demonstration waiver, indicating potential wait times for services beyond basic Medicaid coverage.',
    phoneScript:
      '"I am calling to inquire about the Katie Beckett Medicaid program for my child with a disability. Can you guide me through the application process and required forms?"',
  },
  SC: {
    stateCode: 'SC',
    stateName: 'South Carolina',
    programName: 'Katie Beckett TEFRA Children',
    programAcronym: 'TEFRA',
    requiredForm: 'TEFRA Application Form, FM 3291 ME (TEFRA In-Home Care Certification), Child Under Age 19 Disability Report',
    requiredFormNote:
      'The TEFRA Application Form is the primary application. The FM 3291 ME, TEFRA In-Home Care Certification, must be completed by the child\'s physician to certify that the child can be cared for at home despite needing institutional-level care. The Child Under Age 19 Disability Report is also required to establish disability.',
    incomeRuleHeadline:
      'Parental income is excluded for eligibility.',
    incomeRuleDetail:
      'For the TEFRA (Katie Beckett) program, eligibility is based solely on the child\'s income and resources, with parental income being waived. The child\'s gross monthly income must be below $2,982 and countable resources at or below $2,000.',
    applicationUrl: 'https://apply.scdhhs.gov/',
    applicationPortalName: 'Healthy Connections Medicaid',
    waiverPrograms: [
      {
        name: 'Community Supports Waiver',
        acronym: 'CS Waiver',
        description: 'This waiver serves people with intellectual disabilities and related disabilities who meet the Intermediate Care Facility for Individuals with Intellectual Disabilities (ICF-IID) level of care.',
      },
      {
        name: 'Intellectual Disability and Related Disabilities Waiver',
        acronym: 'ID/RD Waiver',
        description: 'This waiver provides services to individuals with intellectual disabilities and related disabilities to prevent or delay institutionalization.',
      },
      {
        name: 'Medically Complex Children Waiver',
        acronym: 'MCCW',
        description: 'This waiver provides services for children with complex medical needs who require hospital or nursing facility level of care but can be cared for at home.',
      }
    ],
    medicaidPhone: '1-888-549-0820',
    stateTip:
      'South Carolina has a waiting list for some waiver programs; it is advisable to apply early and contact Family Connection of South Carolina for assistance and support.',
    phoneScript:
      '"I am calling to inquire about applying for the Katie Beckett/TEFRA Medicaid program for my child with a disability. Can you guide me through the application process and required forms?"',
  },
  TN: {
    stateCode: 'TN',
    stateName: 'Tennessee',
    programName: 'Katie Beckett Waiver',
    programAcronym: '',
    requiredForm: 'DDA assessment, Katie Beckett MD Cert Form',
    requiredFormNote:
      'The DDA assessment is conducted by a Department of Disability and Aging case manager to determine medical eligibility. The Katie Beckett MD Cert Form is a medical certification form that a child\'s doctor must complete to certify the child meets the level of care and their needs can be safely met at home.',
    incomeRuleHeadline:
      'Parental income and assets are excluded for eligibility in the Katie Beckett program.',
    incomeRuleDetail:
      'Parental income and assets are not counted for a child\'s eligibility for the Katie Beckett program. However, parents must pay a monthly premium for Part A if their income is more than 150% of the federal poverty level. The amount of the premium depends on the family\'s income, with the child\'s portion of private insurance deducted from the premium.',
    applicationUrl: 'https://tenncareconnect.tn.gov/',
    applicationPortalName: 'TennCare Connect',
    waiverPrograms: [
      {
        name: 'Katie Beckett Part A',
        acronym: '',
        description: 'For children with the most significant disabilities or complex medical needs who qualify for institutional care but are cared for at home, receiving full Medicaid benefits and up to $15,000 in home and community-based services.',
      },
      {
        name: 'Katie Beckett Part B',
        acronym: '',
        description: 'For children with disabilities or complex medical needs who are at risk of institutionalization, receiving up to $10,000 a year in services and not enrolled in Medicaid.',
      },
      {
        name: 'Katie Beckett Part C',
        acronym: '',
        description: 'For children who have Medicaid but are losing it due to increased parental income or resources, allowing them to keep Medicaid if they would qualify for Part A and no Part A slot is open.',
      }
    ],
    medicaidPhone: '1-800-654-4839',
    stateTip:
      'Be sure to have medical documents that clearly identify your child’s condition and/or proof of intellectual disability ready for the DDA assessment to avoid delays in enrollment.',
    phoneScript:
      '"I am calling to inquire about applying for the Katie Beckett program for my child with disabilities. Can you guide me through the self-referral process or connect me with a DDA case manager?"',
  },
  UT: {
    stateCode: 'UT',
    stateName: 'Utah',
    programName: 'Medically Complex Children\'s Waiver',
    programAcronym: 'MCCW',
    requiredForm: 'Medically Complex Children\'s Waiver Application',
    requiredFormNote:
      'This application determines if a child meets the specific program requirements. It requires recent clinical documentation, including a history and physical or well-child check summary from the child\'s physicians, and an Authorization to Disclose Health Information. A disability determination by the State Medical Review Board or SSI Disability Designation is also coordinated as part of this process.',
    incomeRuleHeadline:
      'Parental income is excluded for the Medically Complex Children\'s Waiver.',
    incomeRuleDetail:
      'For the Medically Complex Children\'s Waiver, financial eligibility is based solely on the child\'s income and assets, with parental income and assets being disregarded. This means a family\'s income will not prevent a child from qualifying for the waiver if they meet the medical criteria.',
    applicationUrl: 'https://jobs.utah.gov/mycase/',
    applicationPortalName: 'MyCase',
    waiverPrograms: [
      {
        name: 'Medically Complex Children\'s Waiver',
        acronym: 'MCCW',
        description: 'Provides supportive services to parents and caregivers of medically complex children, allowing access to Medicaid services to live independently within their communities.',
      },
      {
        name: 'Community Supports Waiver for Individuals with Intellectual Disabilities and Other Related Conditions',
        acronym: 'CSW',
        description: 'Provides home and community-based services for individuals with intellectual disabilities or related conditions.',
      },
      {
        name: 'Limited Supports Waiver',
        acronym: 'LSW',
        description: 'A newer waiver designed to provide limited support services.',
      }
    ],
    medicaidPhone: '1-800-662-9651',
    stateTip:
      'The Medically Complex Children\'s Waiver (MCCW) has a waitlist, and applicants are enrolled based on the highest confirmed acuity score as spots become available. Early application is recommended.',
    phoneScript:
      '"I am calling to inquire about applying for disability-based Medicaid for my child with autism/developmental disabilities. Can you provide information on programs like the Medically Complex Children\'s Waiver or other waivers that do not consider parental income?"',
  },
  VT: {
    stateCode: 'VT',
    stateName: 'Vermont',
    programName: 'Disabled Children\'s Home Care - Katie Beckett Program',
    programAcronym: 'DCHC',
    requiredForm: 'Disability Report – Child (211C-CHILD)',
    requiredFormNote:
      'This form is used to report and answer questions about your child\'s disability to determine eligibility for the DCHC program. It should be filled out comprehensively.',
    incomeRuleHeadline:
      'Parental income is not counted for eligibility in this program.',
    incomeRuleDetail:
      'The Disabled Children\'s Home Care (Katie Beckett) program in Vermont is based solely on the child\'s income. Parental income and resources are not considered when determining eligibility for this Medicaid pathway.',
    applicationUrl: 'https://www.vermonthealthconnect.gov/',
    applicationPortalName: 'Vermont Health Connect',
    waiverPrograms: [
      {
        name: 'Global Commitment to Health',
        acronym: '',
        description: 'This is Vermont\'s replacement Medicaid program that includes home and community-based services and can be accessed by children with disabilities through the DCHC program.',
      }
    ],
    medicaidPhone: '1-800-250-8427',
    stateTip:
      'Vermont\'s Disabled Children\'s Home Care (Katie Beckett) program and the Global Commitment to Health waiver currently have no waiting lists.',
    phoneScript:
      '"I am calling to inquire about the Disabled Children\'s Home Care (Katie Beckett) program and to start the application process for my child."',
  },
  WA: {
    stateCode: 'WA',
    stateName: 'Washington',
    programName: 'Apple Health Classic Medicaid (TEFRA/Katie Beckett Option)',
    programAcronym: 'TEFRA/KBM',
    requiredForm: 'Children\'s Support Assessment (for ages 15 and younger); Support Intensity Scale (for ages 16 and older)',
    requiredFormNote:
      'The Children\'s Support Assessment is used for individuals aged 15 and younger to determine eligibility for developmental disability services. The Support Intensity Scale is used for individuals aged 16 and older for the same purpose. These assessments are completed by DDA staff.',
    incomeRuleHeadline:
      'Parental income is excluded for disability-based Medicaid pathways in Washington State.',
    incomeRuleDetail:
      'For children applying for Apple Health Classic Medicaid based on disability, only the child\'s income is considered, not the parents\' income. This allows children from families with higher incomes to qualify for Medicaid if they meet the disability criteria and need institutional level of care at home.',
    applicationUrl: 'https://www.washingtonconnection.org/eapplication/home.go?action=Introduction',
    applicationPortalName: 'Washington Connection',
    waiverPrograms: [
      {
        name: 'Basic Plus',
        acronym: '',
        description: 'Provides services and supports for individuals with intellectual and developmental disabilities.',
      },
      {
        name: 'Children\'s Intensive In-home Behavioral Supports',
        acronym: 'CIIBS',
        description: 'Offers intensive behavioral support services for children with developmental disabilities.',
      },
      {
        name: 'Individual and Family Services',
        acronym: '',
        description: 'Supports individuals with intellectual and developmental disabilities who live with their family.',
      }
    ],
    medicaidPhone: '1-877-501-2233',
    stateTip:
      'Get on waiver waitlists as soon as possible, as there can be significant wait times for services.',
    phoneScript:
      '"I am calling to inquire about applying for Apple Health Classic Medicaid for my child with a disability, specifically through the TEFRA/Katie Beckett option, where parental income is not considered. Can you guide me through the application process and explain the required disability assessments?"',
  },
  WI: {
    stateCode: 'WI',
    stateName: 'Wisconsin',
    programName: 'Katie Beckett Medicaid',
    programAcronym: 'KBP',
    requiredForm: 'F-20582, Medicaid – Katie Beckett Program Application',
    requiredFormNote:
      'This form is used for your child\'s application or recertification for Wisconsin Medicaid through the Katie Beckett Program. It is used to assess your child’s disability and level of care needs. Parents or legal guardians with legal authority over the child must sign and date the form.',
    incomeRuleHeadline:
      'Parental income is excluded for Katie Beckett Medicaid eligibility.',
    incomeRuleDetail:
      'The Katie Beckett Program bases a child’s eligibility on their disability and income, not on their family’s income. This allows children who would not be Medicaid eligible due to high parental income to qualify. The child\'s own income cannot exceed $2,382 per month.',
    applicationUrl: 'https://www.dhs.wisconsin.gov/kbp/apply.htm',
    applicationPortalName: 'ACCESS Wisconsin',
    waiverPrograms: [
      {
        name: 'Children\'s Long-Term Support Program',
        acronym: 'CLTS',
        description: 'This is a home and community-based service waiver that helps children with disabilities and their families through supports and services, aiming to keep kids at home instead of an institution.',
      },
      {
        name: 'TEFRA Program',
        acronym: 'TEFRA',
        description: 'Wisconsin currently has a TEFRA program that can serve children with disabilities.',
      }
    ],
    medicaidPhone: '1-888-786-3246',
    stateTip:
      'Wisconsin has eliminated the waitlist for the Children\'s Long-Term Support (CLTS) Program through a continuous enrollment approach, ensuring eligible children receive services promptly.',
    phoneScript:
      '"I am calling to inquire about applying for the Katie Beckett Medicaid program for my child with a disability. Could you please guide me through the initial steps and forms required?"',
  },
  WV: {
    stateCode: 'WV',
    stateName: 'West Virginia',
    programName: 'Children with Disabilities Community Service Program (CDCSP) / The Katie Beckett Waiver',
    programAcronym: 'CDCSP',
    requiredForm: 'CDCSP 2A (for ICF Level of Care), CDCSP 2B (for Acute Hospital/Nursing Facility Levels of Care), Cost Estimate Worksheet, SSI Denial Letter',
    requiredFormNote:
      'The CDCSP 2A and 2B forms are medical evaluation forms completed by a medical professional to determine the child\'s level of care. The Cost Estimate Worksheet helps compare in-home care costs to institutional care. An SSI denial letter is required if the child was denied SSI due to parental income/assets.',
    incomeRuleHeadline:
      'Parental income is excluded for the Children with Disabilities Community Service Program (CDCSP).',
    incomeRuleDetail:
      'For the Children with Disabilities Community Service Program (CDCSP), only the child\'s income and assets are considered. Parental income and assets are not counted towards the child\'s eligibility. The child\'s assets, excluding residence and furnishings, may not exceed $2,000.',
    applicationUrl: 'https://www.wvpath.wv.gov/application',
    applicationPortalName: 'WV PATH (People\'s Access To Help)',
    waiverPrograms: [
      {
        name: 'Children with Serious Emotional Disorder Waiver',
        acronym: 'CSEDW',
        description: 'Provides additional Medicaid support to children aged 3-21 with serious mental, behavioral, or emotional health needs to help them remain at home or in the community.',
      },
      {
        name: 'Intellectual/Developmental Disabilities Waiver',
        acronym: 'IDDW',
        description: 'Offers services to children and adults with intellectual/developmental disabilities to promote independence in their homes and communities.',
      },
      {
        name: 'Traumatic Brain Injury Waiver',
        acronym: 'TBIW',
        description: 'Provides home-based support for individuals aged 3 and older with a traumatic brain injury who meet medical and financial requirements.',
      }
    ],
    medicaidPhone: '1-304-558-1700',
    stateTip:
      'The Children with Disabilities Community Service Program (CDCSP), also known as the Katie Beckett Waiver, is a vital program in West Virginia that disregards parental income, allowing children with significant disabilities to access Medicaid services regardless of their family\'s financial status.',
    phoneScript:
      '"I am calling to inquire about the Children with Disabilities Community Service Program, also known as the Katie Beckett Waiver, for my child. I would like to understand the application process and what forms are required."',
  },
  WY: {
    stateCode: 'WY',
    stateName: 'Wyoming',
    programName: 'Wyoming Katie Beckett Program',
    programAcronym: '',
    requiredForm: 'LT-104 assessment (I/DD) and comprehensive autism evaluation',
    requiredFormNote:
      'The LT-104 assessment determines the level of care for individuals with intellectual and developmental disabilities. A comprehensive autism evaluation, completed by a developmental pediatrician, child psychologist, neuropsychologist, or licensed psychologist, is also required to document substantial functional limitations and adaptive behavior scores.',
    incomeRuleHeadline:
      'Parental income is excluded for the Wyoming Katie Beckett program and HCBS waivers for children with disabilities.',
    incomeRuleDetail:
      'Wyoming\'s Katie Beckett program allows children under 19 with significant disabilities to qualify for Medicaid based on their own income and resources, disregarding parental income. For the Comprehensive/Supports Waivers, the child\'s income must be no more than $2,349/month (300% SSI) and assets no more than $2,000.',
    applicationUrl: 'https://www.wesystem.wyo.gov/',
    applicationPortalName: 'WY Medicaid/CHIP Web Portal',
    waiverPrograms: [
      {
        name: 'Comprehensive Waiver',
        acronym: '',
        description: 'Provides higher-intensity services for individuals with intellectual and developmental disabilities, including autism, who require an institutional level of care.',
      },
      {
        name: 'Supports Waiver',
        acronym: '',
        description: 'Offers lower-intensity services for individuals with intellectual and developmental disabilities who live more independently or with family support.',
      },
      {
        name: 'Children\'s Mental Health Waiver',
        acronym: '',
        description: 'Serves children with serious emotional disturbance or mental illness who meet a hospital level of care.',
      }
    ],
    medicaidPhone: '1-855-294-2127',
    stateTip:
      'Apply for the Katie Beckett option and relevant waivers as early as possible, as the application date is crucial for waitlist prioritization. Even if you think your income is too high, apply for Wyoming Medicaid online, as the Katie Beckett option bypasses parental income limits.',
    phoneScript:
      '"I am calling to inquire about applying for Medicaid for my child with a disability under the Katie Beckett option. I would like to request an autism intake and be screened for the Comprehensive Waiver, Supports Waiver, and the Katie Beckett option. Please document our application date today and place us on every applicable list."',
  },
  },
  SD: {
    stateCode: 'SD',
    stateName: 'South Dakota',
    programName: 'Disabled Children\'s Program (TEFRA)',
    programAcronym: 'DCP',
    requiredForm: 'Level of Care Assessment (Intermediate Care Facility or Nursing Facility level)',
    requiredFormNote:
      'A medical assessment is required to establish that your child meets an Intermediate Care Facility or Nursing Facility level of care. This is completed with the help of your child\'s physician and the South Dakota DSS.',
    incomeRuleHeadline:
      'Parental income is not counted — eligibility is based on the child\'s income only.',
    incomeRuleDetail:
      'South Dakota\'s Disabled Children\'s Program (TEFRA) waives parental income for eligibility purposes. Only the child\'s own income is considered, making it accessible to families at any income level. The Family Support 360 and CHOICES waivers also use the child\'s income only.',
    applicationUrl: 'https://dss.sd.gov/economicassistance/medical_programs.aspx',
    applicationPortalName: 'South Dakota DSS Benefits Portal',
    waiverPrograms: [
      {
        name: 'Disabled Children\'s Program',
        acronym: 'DCP',
        description:
          'TEFRA program providing Medicaid coverage for children ages 0–18 with any disability (medical, developmental, intellectual, or psychiatric) who would otherwise require institutional care.',
      },
      {
        name: 'Family Support 360 Waiver',
        acronym: 'FS360',
        description:
          'Provides personal care, respite, support coordination, therapies, and adaptive equipment for children and adults with intellectual or developmental disabilities.',
      },
      {
        name: 'CHOICES Waiver',
        acronym: 'CHOICES',
        description:
          'Provides day services, residential habilitation, supported employment, and case management for children and adults with intellectual or developmental disabilities.',
      },
    ],
    medicaidPhone: '1-605-773-4678',
    stateTip:
      'The Family Support 360 and CHOICES waivers have a combined interest list of about 80 individuals with a wait of one to two years — apply as early as possible even before your child is fully approved for the Disabled Children\'s Program.',
    phoneScript:
      '"I\'d like to apply for the Disabled Children\'s Program for my child with a disability. Can you tell me what documentation is needed and how to get started?"',
  },
};

export const BETA_STATES = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY', 'SD'];

export const STATE_OPTIONS = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];
