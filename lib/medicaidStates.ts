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
      "\"I'd like to submit an LTD application for my child. They have a completed PMIP form from their provider. Can you tell me the process and where to submit?\"",
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
      "\"I'd like to submit a disability-based Medicaid application for my child. I have provider documentation of their needs (Form 3052). Can you tell me the process and where to submit?\"",
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
      "\"I'd like to start the process for my child's developmental disability eligibility determination for Medicaid waiver services. Can you tell me how to get the VIDES assessment scheduled?\"",
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
      "\"I'd like to apply for the Children's Community Alternative Disability Program (CCADP) for my child. Can you tell me what documentation I need and how to get started?\"",
  },
};

export const BETA_STATES = ['CO', 'TX', 'VA', 'DE'];

export const STATE_OPTIONS = [
  { code: 'CO', name: 'Colorado' },
  { code: 'TX', name: 'Texas' },
  { code: 'VA', name: 'Virginia' },
  { code: 'DE', name: 'Delaware' },
];
