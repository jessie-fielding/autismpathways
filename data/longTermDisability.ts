// Long-Term Disability Programs — All 50 States + DC
// Sources: KFF 2025 HCBS Survey, SpecialNeedsTrustByState.com, individual state DD agency reports
// Last updated: May 2026

export interface LTDProgram {
  name: string;
  type: 'medicaid_waiver' | 'state_program' | 'federal' | 'housing' | 'employment' | 'financial';
  description: string;
  eligibility: string;
  howToApply: string;
  phone?: string;
  website?: string;
  waitlist?: string;
}

export interface StateLTDData {
  state: string;
  abbreviation: string;
  overview: string;
  waitlistStatus: 'none' | 'short' | 'moderate' | 'long' | 'severe';
  waitlistNote?: string;
  programs: LTDProgram[];
  actionSteps: string[];
}

// ─── FEDERAL PROGRAMS (apply in every state) ─────────────────────────────────

export const FEDERAL_PROGRAMS: LTDProgram[] = [
  {
    name: 'Supplemental Security Income (SSI)',
    type: 'federal',
    description:
      'Monthly cash payments for individuals with disabilities who have limited income and resources. Autism qualifies as a disability. In most states, SSI automatically confers Medicaid eligibility.',
    eligibility:
      'Must have a qualifying disability (autism qualifies), be under income/resource limits ($2,000 individual / $3,000 couple in countable resources). No work history required.',
    howToApply:
      'Apply online at ssa.gov, by phone, or in person at your local Social Security office. Apply as early as possible — retroactive benefits are limited.',
    phone: '1-800-772-1213',
    website: 'https://www.ssa.gov/ssi',
  },
  {
    name: 'Social Security Disability Insurance (SSDI)',
    type: 'federal',
    description:
      'Monthly benefits for individuals who have worked and paid Social Security taxes. Most autistic adults qualify through a parent\'s work record (Disabled Adult Child / DAC benefit) if disability began before age 22.',
    eligibility:
      'Must have a qualifying disability. For DAC benefits: disability must have begun before age 22, and a parent must be deceased, retired, or receiving SSDI.',
    howToApply:
      'Apply online at ssa.gov/disability or call Social Security. For DAC benefits, apply when a parent retires, becomes disabled, or passes away.',
    phone: '1-800-772-1213',
    website: 'https://www.ssa.gov/disability',
  },
  {
    name: 'Medicaid (Base Coverage)',
    type: 'federal',
    description:
      'Federal/state health insurance covering doctor visits, prescriptions, therapies, and more. SSI recipients qualify automatically in most states. Required for Medicaid waiver services.',
    eligibility:
      'SSI recipients qualify automatically in most states. Others may qualify based on income. Apply separately from waiver services.',
    howToApply:
      'Apply through your state Medicaid agency or via HealthCare.gov. SSI application often triggers automatic Medicaid enrollment.',
    website: 'https://www.medicaid.gov',
  },
  {
    name: 'ABLE Account',
    type: 'financial',
    description:
      'Tax-advantaged savings account for disability-related expenses. Funds do not count against SSI or Medicaid eligibility. Annual contribution limit: $19,000 (2025). Account balance up to $100,000 does not affect SSI.',
    eligibility:
      'Disability must have begun before age 46 (expanded in 2026 from age 26). Must have a qualifying disability diagnosis.',
    howToApply:
      'Open through your state\'s ABLE program or a multi-state program like ABLEnow. Visit ablenrc.org to compare state programs.',
    website: 'https://www.ablenrc.org',
  },
  {
    name: 'Section 8 Housing Choice Voucher',
    type: 'housing',
    description:
      'Federal rental assistance for low-income individuals with disabilities. Pays the difference between 30% of income and fair market rent. Apply through your local Public Housing Authority (PHA).',
    eligibility:
      'Low income (generally under 50% of area median income), disability or other qualifying status.',
    howToApply:
      'Contact your local Public Housing Authority. Waitlists are common — apply as soon as possible.',
    website: 'https://www.hud.gov/topics/housing_choice_voucher_program_section_8',
  },
  {
    name: 'Vocational Rehabilitation (VR)',
    type: 'employment',
    description:
      'Free job training, placement, and support services for individuals with disabilities. Every state has a VR agency. Services include job coaching, assistive technology, education funding, and supported employment.',
    eligibility:
      'Must have a disability that creates a barrier to employment and be able to benefit from VR services.',
    howToApply:
      'Contact your state VR agency. Find your state agency at rsa.ed.gov/about/states.',
    website: 'https://rsa.ed.gov/about/states',
  },
  {
    name: 'Special Needs Trust (SNT)',
    type: 'financial',
    description:
      'Legal trust that holds assets for a person with disabilities without affecting SSI, Medicaid, or waiver eligibility. Third-party SNTs (funded by family) have no payback requirement. First-party SNTs (funded with the individual\'s own assets) require Medicaid payback.',
    eligibility:
      'Any individual with a qualifying disability. Must be established by an attorney familiar with special needs planning.',
    howToApply:
      'Consult a special needs attorney in your state. Find one at specialneedsanswers.com or through your state bar association.',
    website: 'https://www.autismspeaks.org/tool-kit-excerpt/special-needs-trusts',
  },
];

// ─── ALL 50 STATES + DC ───────────────────────────────────────────────────────

export const STATE_LTD_DATA: StateLTDData[] = [
  {
    state: 'Alabama',
    abbreviation: 'AL',
    overview:
      'Alabama offers three Medicaid HCBS waivers for individuals with intellectual and developmental disabilities. The waitlist has approximately 1,848 people with waits of several years.',
    waitlistStatus: 'moderate',
    waitlistNote: '~1,848 on waitlist | Several years',
    programs: [
      {
        name: 'Intellectual Disabilities (ID) Waiver',
        type: 'medicaid_waiver',
        description:
          'Provides residential, day, and community support services for adults with intellectual disabilities including autism.',
        eligibility: 'Intellectual disability diagnosis, Medicaid eligible, need for institutional level of care.',
        howToApply: 'Contact Alabama Medicaid at 1-800-361-4491 or your local DD agency.',
        phone: '1-800-361-4491',
        website: 'https://medicaid.alabama.gov',
      },
      {
        name: 'Living at Home (LAH) Waiver',
        type: 'medicaid_waiver',
        description: 'Supports individuals with DD to remain in their family home with community-based services.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact Alabama Medicaid at 1-800-361-4491.',
        phone: '1-800-361-4491',
      },
      {
        name: 'Community Waiver Program (CWP)',
        type: 'medicaid_waiver',
        description: 'Available in 11 counties. Provides community support services for individuals with DD.',
        eligibility: 'Developmental disability, Medicaid eligible, reside in one of the 11 participating counties.',
        howToApply: 'Contact Alabama Medicaid at 1-800-361-4491.',
        phone: '1-800-361-4491',
      },
    ],
    actionSteps: [
      'Apply for SSI immediately to establish Medicaid eligibility',
      'Get on the ID Waiver waitlist as early as possible — call 1-800-361-4491',
      'Open an ABLE account to save for disability-related expenses while waiting',
      'Contact your local Arc of Alabama chapter for navigation support',
    ],
  },
  {
    state: 'Alaska',
    abbreviation: 'AK',
    overview:
      'Alaska has two HCBS waivers for individuals with IDD. Only about 50 people are drawn from the waitlist annually, implying a 14+ year wait for the 721 currently waiting.',
    waitlistStatus: 'severe',
    waitlistNote: '~721 on waitlist | 14+ year implied wait (50 slots/year)',
    programs: [
      {
        name: 'IDD Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive services including residential support, day habilitation, and personal care for adults with IDD.',
        eligibility: 'Intellectual or developmental disability, Medicaid eligible.',
        howToApply: 'Contact the Aging & Disability Resource Center at 1-877-625-2372.',
        phone: '1-877-625-2372',
        website: 'https://dhss.alaska.gov/dsds',
      },
      {
        name: 'Individualized Supports Waiver',
        type: 'medicaid_waiver',
        description: 'Flexible, person-centered supports for individuals with IDD who do not need 24-hour residential care.',
        eligibility: 'IDD diagnosis, Medicaid eligible.',
        howToApply: 'Contact the Aging & Disability Resource Center at 1-877-625-2372.',
        phone: '1-877-625-2372',
      },
    ],
    actionSteps: [
      'Get on the waitlist immediately — only 50 slots open per year',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact your local ADRC at 1-877-625-2372 for interim services',
      'Explore Vocational Rehabilitation for employment support while waiting',
    ],
  },
  {
    state: 'Arizona',
    abbreviation: 'AZ',
    overview:
      'Arizona has NO waitlist for DD waiver services. The Division of Developmental Disabilities (DDD) serves all eligible individuals through ALTCS (Arizona Long Term Care System), a managed care model serving 59,000+ people.',
    waitlistStatus: 'none',
    waitlistNote: 'No waitlist — all eligible individuals served',
    programs: [
      {
        name: 'DDD / ALTCS',
        type: 'medicaid_waiver',
        description:
          'Arizona\'s comprehensive long-term care program for individuals with developmental disabilities. Covers residential, day, employment, behavioral, and personal care services. Autism is a qualifying condition.',
        eligibility:
          'Arizona resident, autism or other DD diagnosis that began before age 18, functional and financial eligibility criteria.',
        howToApply:
          'Apply through the Arizona Department of Economic Security (DES) DDD division. Submit a DDD Application for Eligibility Determination.',
        phone: '1-844-770-9500',
        website: 'https://des.az.gov/services/disabilities/developmental-disabilities',
      },
    ],
    actionSteps: [
      'Apply for DDD eligibility as soon as possible — no waitlist means services start after eligibility determination',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact DES DDD at 1-844-770-9500 to start the application',
      'Open an ABLE account for additional savings',
    ],
  },
  {
    state: 'Arkansas',
    abbreviation: 'AR',
    overview:
      'Arkansas offers the Community and Employment Support (CES) Waiver for individuals with DD. The waitlist has 1,600–4,500 people (sources vary) with an approximate 10-year wait.',
    waitlistStatus: 'severe',
    waitlistNote: '~1,600–4,500 on waitlist | ~10 year wait',
    programs: [
      {
        name: 'Community and Employment Support (CES) Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community-based residential, employment, and day services for adults with developmental disabilities.',
        eligibility: 'Developmental disability diagnosis, Medicaid eligible, need for institutional level of care.',
        howToApply: 'Contact the Division of Developmental Disabilities Services at 501-683-5687.',
        phone: '501-683-5687',
        website: 'https://humanservices.arkansas.gov/divisions-shared-services/developmental-disabilities-services',
      },
    ],
    actionSteps: [
      'Get on the CES Waiver waitlist immediately — 10-year wait is common',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact Arkansas DDS at 501-683-5687',
      'Explore Vocational Rehabilitation for employment support',
    ],
  },
  {
    state: 'California',
    abbreviation: 'CA',
    overview:
      'California is an entitlement state under the Lanterman Act — all eligible individuals have a legal right to services with NO waitlist. Services are delivered through 21 Regional Centers statewide, serving approximately 380,000 people.',
    waitlistStatus: 'none',
    waitlistNote: 'Entitlement state — legal right to services, no waitlist',
    programs: [
      {
        name: 'Regional Center Services (Lanterman Act)',
        type: 'state_program',
        description:
          'California\'s Regional Centers provide lifelong services for individuals with developmental disabilities including autism. Services include residential support, day programs, employment, respite, and more. This is an entitlement — services cannot be denied to eligible individuals.',
        eligibility:
          'Developmental disability (including autism) that began before age 18 and is expected to continue indefinitely. No income limits.',
        howToApply:
          'Contact your local Regional Center. Find your Regional Center at dds.ca.gov/rc/find-your-regional-center.',
        phone: '916-654-1690',
        website: 'https://www.dds.ca.gov',
      },
    ],
    actionSteps: [
      'Contact your local Regional Center immediately — services are an entitlement',
      'Apply for SSI (income-based, separate from Regional Center)',
      'Find your Regional Center at dds.ca.gov/rc/find-your-regional-center',
      'Open an ABLE account for additional tax-advantaged savings',
    ],
  },
  {
    state: 'Colorado',
    abbreviation: 'CO',
    overview:
      'Colorado has a waitlist of ~2,345 for the HCBS-DD (24-hour residential) waiver with an ~8-year wait. However, the HCBS-SLS (Supported Living Services) waiver has no waitlist and most people receive SLS services while waiting for residential placement.',
    waitlistStatus: 'moderate',
    waitlistNote: '~2,345 on HCBS-DD waitlist | ~8 years | SLS waiver has no waitlist',
    programs: [
      {
        name: 'HCBS-DD Waiver (24-hour residential)',
        type: 'medicaid_waiver',
        description: 'Provides 24-hour residential and comprehensive community support for adults with DD.',
        eligibility: 'Developmental disability, Medicaid eligible, need for 24-hour support.',
        howToApply: 'Contact your local Community Centered Board (CCB).',
        website: 'https://hcpf.colorado.gov/long-term-services-and-supports',
      },
      {
        name: 'HCBS-SLS Waiver (Supported Living Services)',
        type: 'medicaid_waiver',
        description: 'No waitlist. Provides in-home and community support services for adults with DD who do not need 24-hour care.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local Community Centered Board (CCB) — no waitlist.',
        website: 'https://hcpf.colorado.gov/long-term-services-and-supports',
      },
    ],
    actionSteps: [
      'Apply for HCBS-SLS immediately — no waitlist, services available now',
      'Get on the HCBS-DD waitlist if 24-hour residential support is needed',
      'Contact your local Community Centered Board (CCB)',
      'Apply for SSI to establish Medicaid eligibility',
    ],
  },
  {
    state: 'Connecticut',
    abbreviation: 'CT',
    overview:
      'Connecticut has two separate waiver systems: DDS waivers for individuals with IQ 69 or below (minimal wait for day/employment), and a DSS Autism Waiver for those with autism and IQ 70+ (2,652 waiting, 10+ year wait).',
    waitlistStatus: 'severe',
    waitlistNote: '2,652 on Autism Waiver waitlist | 10+ year wait',
    programs: [
      {
        name: 'DDS Waivers (I/DD)',
        type: 'medicaid_waiver',
        description: 'Comprehensive, Individual & Family Supports, and Employment & Day Supports waivers for individuals with IQ 69 or below. Minimal wait for day/employment supports.',
        eligibility: 'Intellectual disability (IQ 69 or below), Medicaid eligible.',
        howToApply: 'Contact DDS at 860-418-6000.',
        phone: '860-418-6000',
        website: 'https://portal.ct.gov/dds',
      },
      {
        name: 'DSS Autism Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community-based services for individuals with autism and IQ 70+. Significant waitlist of 2,652 with 10+ year wait.',
        eligibility: 'Autism diagnosis, IQ 70 or above, Medicaid eligible.',
        howToApply: 'Contact DSS for the Autism Waiver application.',
        website: 'https://portal.ct.gov/dss',
      },
    ],
    actionSteps: [
      'Get on the Autism Waiver waitlist immediately — 10+ year wait',
      'Apply for DDS services if IQ is 69 or below (shorter wait)',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact DDS at 860-418-6000 to determine which waiver applies',
    ],
  },
  {
    state: 'Delaware',
    abbreviation: 'DE',
    overview:
      'Delaware has NO waitlist for DD services. The Division of Developmental Disabilities Services (DDDS) Lifespan program serves approximately 1,650 individuals with no funding-based waitlist.',
    waitlistStatus: 'none',
    waitlistNote: 'No waitlist — all eligible individuals served',
    programs: [
      {
        name: 'DDDS Lifespan Program',
        type: 'medicaid_waiver',
        description: 'Comprehensive lifelong services for individuals with developmental disabilities including autism. Covers residential, day, employment, and community support.',
        eligibility: 'Developmental disability diagnosis, Delaware resident.',
        howToApply: 'Contact DDDS at 302-255-9675.',
        phone: '302-255-9675',
        website: 'https://dhss.delaware.gov/dhss/ddds',
      },
    ],
    actionSteps: [
      'Apply for DDDS services — no waitlist means services start after eligibility determination',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact DDDS at 302-255-9675',
    ],
  },
  {
    state: 'Florida',
    abbreviation: 'FL',
    overview:
      'Florida has one of the largest DD waiver waitlists in the nation — over 22,621 people on the iBudget Waiver pre-enrollment list, with 32% waiting 10 or more years. Florida does not screen for eligibility before waitlist placement.',
    waitlistStatus: 'severe',
    waitlistNote: '22,621+ on waitlist | 7–15 year wait | 32% wait 10+ years',
    programs: [
      {
        name: 'iBudget Waiver',
        type: 'medicaid_waiver',
        description: 'Florida\'s main DD waiver providing individualized budgets for community-based services including residential support, day programs, employment, and behavioral services.',
        eligibility: 'Developmental disability (including autism), Medicaid eligible, need for institutional level of care.',
        howToApply: 'Contact the Agency for Persons with Disabilities (APD) at 1-866-273-2273.',
        phone: '1-866-273-2273',
        website: 'https://apd.myflorida.com',
      },
    ],
    actionSteps: [
      'Get on the iBudget Waiver waitlist TODAY — 7–15 year wait is common',
      'Apply for SSI immediately to establish Medicaid eligibility',
      'Contact APD at 1-866-273-2273',
      'Explore Vocational Rehabilitation for employment support while waiting',
      'Open an ABLE account and consider a Special Needs Trust for long-term planning',
    ],
  },
  {
    state: 'Georgia',
    abbreviation: 'GA',
    overview:
      'Georgia funds only ~100 new waiver slots per year against a waitlist of nearly 8,000. At this rate, families face waits measured in decades. The NOW and COMP waivers currently serve about 14,100 people.',
    waitlistStatus: 'severe',
    waitlistNote: '~7,900 on waitlist | Decades at ~100 new slots/year',
    programs: [
      {
        name: 'New Options Waiver (NOW)',
        type: 'medicaid_waiver',
        description: 'Provides community-based services for individuals with DD who need less intensive support.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Apply through your DBHDD regional office.',
        website: 'https://dbhdd.georgia.gov',
      },
      {
        name: 'Comprehensive Supports (COMP) Waiver',
        type: 'medicaid_waiver',
        description: 'Provides comprehensive services including 24-hour residential support for individuals with DD.',
        eligibility: 'Developmental disability, Medicaid eligible, need for comprehensive support.',
        howToApply: 'Apply through your DBHDD regional office.',
        website: 'https://dbhdd.georgia.gov',
      },
    ],
    actionSteps: [
      'Get on the waitlist immediately — only ~100 slots open per year',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact your DBHDD regional office',
      'Contact The Arc of Georgia for advocacy support',
      'Open an ABLE account and consider a Special Needs Trust',
    ],
  },
  {
    state: 'Hawaii',
    abbreviation: 'HI',
    overview:
      'Hawaii has NO waitlist for DD waiver services. The I/DD Waiver serves approximately 3,034 individuals with no funding-based waitlist.',
    waitlistStatus: 'none',
    waitlistNote: 'No waitlist — all eligible individuals served',
    programs: [
      {
        name: 'I/DD Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community-based services for individuals with intellectual and developmental disabilities including autism.',
        eligibility: 'I/DD diagnosis, Medicaid eligible, Hawaii resident.',
        howToApply: 'Contact the Hawaii Department of Health, Developmental Disabilities Division at 808-586-5840.',
        phone: '808-586-5840',
        website: 'https://health.hawaii.gov/ddd',
      },
    ],
    actionSteps: [
      'Apply for I/DD Waiver services — no waitlist',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact Hawaii DDD at 808-586-5840',
    ],
  },
  {
    state: 'Idaho',
    abbreviation: 'ID',
    overview:
      'Idaho has NO waitlist for the Adult DD Waiver. All eligible individuals are served without a funding-based waitlist.',
    waitlistStatus: 'none',
    waitlistNote: 'No waitlist reported',
    programs: [
      {
        name: 'Adult Developmental Disabilities Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community-based services for adults with developmental disabilities including residential support, day habilitation, and personal care.',
        eligibility: 'Developmental disability, Medicaid eligible, Idaho resident.',
        howToApply: 'Contact Idaho IDHW Division of Medicaid at 208-334-5747.',
        phone: '208-334-5747',
        website: 'https://healthandwelfare.idaho.gov/services-programs/disabilities-services',
      },
    ],
    actionSteps: [
      'Apply for DD Waiver services — no waitlist',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact Idaho IDHW at 208-334-5747',
    ],
  },
  {
    state: 'Illinois',
    abbreviation: 'IL',
    overview:
      'Illinois has approximately 16,500 people on the PUNS (Prioritization of Urgency of Need for Services) database with an average wait of ~44 months, accelerating under the Ligas Consent Decree.',
    waitlistStatus: 'long',
    waitlistNote: '~16,500 on PUNS database | ~44 month average wait',
    programs: [
      {
        name: 'Adults with DD Waiver',
        type: 'medicaid_waiver',
        description: 'Provides comprehensive community-based services for adults with developmental disabilities. Prioritized through the PUNS system.',
        eligibility: 'Developmental disability, Medicaid eligible, 18 or older.',
        howToApply: 'Contact your local ISC (Independent Service Coordination) agency or call 1-888-337-5267.',
        phone: '1-888-337-5267',
        website: 'https://www.dhs.state.il.us/page.aspx?item=29764',
      },
      {
        name: 'Children/Young Adults with DD Waiver',
        type: 'medicaid_waiver',
        description: 'Services for children and young adults with developmental disabilities.',
        eligibility: 'Developmental disability, Medicaid eligible, under 22.',
        howToApply: 'Contact your local ISC agency or call 1-888-337-5267.',
        phone: '1-888-337-5267',
      },
    ],
    actionSteps: [
      'Register in the PUNS system immediately — contact your local ISC agency',
      'Apply for SSI to establish Medicaid eligibility',
      'Call 1-888-DD-PLANS (337-5267) to find your local ISC',
      'Contact The Arc of Illinois for advocacy support',
    ],
  },
  {
    state: 'Indiana',
    abbreviation: 'IN',
    overview:
      'Indiana has 9,453 on the waitlist for CIH and Family Supports waivers. Both waivers hit capacity at the end of 2025 with no new slots until July 2026.',
    waitlistStatus: 'severe',
    waitlistNote: '9,453 on waitlist | Multi-year wait | No new slots until July 2026',
    programs: [
      {
        name: 'Community Integration and Habilitation (CIH) Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive community-based services for adults with DD including residential, day, and employment support.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Apply through the BDS Gateway portal at bddsgateway.fssa.in.gov.',
        website: 'https://www.in.gov/fssa/ddrs',
      },
      {
        name: 'Family Supports Waiver',
        type: 'medicaid_waiver',
        description: 'Supports individuals with DD to remain in their family home with community-based services.',
        eligibility: 'Developmental disability, Medicaid eligible, living with family.',
        howToApply: 'Apply through the BDS Gateway portal at bddsgateway.fssa.in.gov.',
        website: 'https://www.in.gov/fssa/ddrs',
      },
    ],
    actionSteps: [
      'Apply through BDS Gateway immediately — bddsgateway.fssa.in.gov',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact Indiana DDRS for interim services',
      'Explore Vocational Rehabilitation for employment support while waiting',
    ],
  },
  {
    state: 'Iowa',
    abbreviation: 'IA',
    overview:
      'Iowa has 7,147–25,536 on the ID Waiver waitlist (Iowa uses a voluntary screening tool; not all have been screened). Wait is up to 5 years. Iowa is redesigning all six waivers into two age-based programs (2026–2027).',
    waitlistStatus: 'long',
    waitlistNote: '7,147+ on waitlist | Up to 5 year wait',
    programs: [
      {
        name: 'Intellectual Disability (ID) Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community-based services for adults with intellectual disabilities. Iowa is redesigning its waiver system with new programs rolling out 2026–2027.',
        eligibility: 'Intellectual disability, Medicaid eligible.',
        howToApply: 'Contact your Managed Care Organization (MCO) or Iowa HHS.',
        website: 'https://hhs.iowa.gov/programs/programs-and-services/disability-services',
      },
    ],
    actionSteps: [
      'Get on the ID Waiver waitlist immediately',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact Iowa HHS or your MCO',
      'Ask about priority screening through the WPNA tool to move up the list',
    ],
  },
  {
    state: 'Kansas',
    abbreviation: 'KS',
    overview:
      'Kansas has ~4,000 on the I/DD Waiver waitlist with an 8–9 year wait. However, bipartisan legislative action is reducing the list (down from 5,400). A new Community Support Waiver launches April 2026.',
    waitlistStatus: 'long',
    waitlistNote: '~4,000 on waitlist | ~8–9 year wait | Actively reducing',
    programs: [
      {
        name: 'I/DD Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community-based services for individuals with intellectual and developmental disabilities.',
        eligibility: 'I/DD diagnosis, Medicaid eligible, 5 years or older.',
        howToApply: 'Contact your local Community Developmental Disability Organization (CDDO) or call 1-855-200-2372.',
        phone: '1-855-200-2372',
        website: 'https://www.kdads.ks.gov/services-programs/long-term-services-supports/home-and-community-based-services-hcbs/waiver-programs/intellectual-developmentally-disabled-i-dd',
      },
      {
        name: 'Autism Waiver (HCBS/AU)',
        type: 'medicaid_waiver',
        description: 'Serves children under age 6 with autism who meet functional eligibility criteria.',
        eligibility: 'Autism diagnosis, under age 6, Medicaid eligible.',
        howToApply: 'Contact your local CDDO or KDHE.',
        website: 'https://www.kdhe.ks.gov',
      },
    ],
    actionSteps: [
      'Get on the I/DD Waiver waitlist immediately — contact your local CDDO',
      'Apply for SSI to establish Medicaid eligibility',
      'Call 1-855-200-2372 to find your local CDDO',
      'Ask about the new Community Support Waiver launching April 2026',
    ],
  },
  {
    state: 'Kentucky',
    abbreviation: 'KY',
    overview:
      'Kentucky has 13,026 on the waitlist with an 8–10 year wait. An analysis showed it would take 168 years to serve everyone at the current funding level. The state added 750 new MPW slots for the current biennium.',
    waitlistStatus: 'severe',
    waitlistNote: '13,026 on waitlist | 8–10 year wait',
    programs: [
      {
        name: 'Michelle P. Waiver (MPW)',
        type: 'medicaid_waiver',
        description: 'Named after a Kentucky woman with Down syndrome, this waiver provides community-based services for individuals with DD including residential, day, and employment support.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Call 502-564-1647, option 4 then option 1.',
        phone: '502-564-1647',
        website: 'https://chfs.ky.gov/agencies/dms/dca/Pages/mpw.aspx',
      },
      {
        name: 'Supports for Community Living (SCL) Waiver',
        type: 'medicaid_waiver',
        description: 'Provides residential and community support services for individuals with intellectual disabilities.',
        eligibility: 'Intellectual disability, Medicaid eligible.',
        howToApply: 'Call 502-564-1647, option 4 then option 1.',
        phone: '502-564-1647',
      },
    ],
    actionSteps: [
      'Get on the waitlist immediately — call 502-564-1647',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact The Arc of Kentucky for advocacy support',
      'Open an ABLE account and consider a Special Needs Trust for long-term planning',
    ],
  },
  {
    state: 'Louisiana',
    abbreviation: 'LA',
    overview:
      'Louisiana has 14,586 on the waitlist across multiple waivers. Wait times are not publicly reported but are expected to be multi-year.',
    waitlistStatus: 'severe',
    waitlistNote: '14,586 on waitlist | Wait time not reported',
    programs: [
      {
        name: 'New Opportunities Waiver (NOW)',
        type: 'medicaid_waiver',
        description: 'Comprehensive community-based services for adults with developmental disabilities.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local Human Services District or OCDD.',
        website: 'https://ldh.la.gov/page/1110',
      },
      {
        name: 'Residential Options Waiver (ROW)',
        type: 'medicaid_waiver',
        description: 'Supports individuals with DD in residential settings.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local Human Services District or OCDD.',
      },
      {
        name: "Children's Choice Waiver",
        type: 'medicaid_waiver',
        description: 'Provides services for children with developmental disabilities to remain in their family home.',
        eligibility: 'Developmental disability, under 18, Medicaid eligible.',
        howToApply: 'Contact your local Human Services District or OCDD.',
      },
    ],
    actionSteps: [
      'Get on the waitlist immediately — contact your local Human Services District',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact OCDD (Office for Citizens with Developmental Disabilities)',
      'Explore interim services through your local Human Services District',
    ],
  },
  {
    state: 'Maine',
    abbreviation: 'ME',
    overview:
      'Maine has 2,244 on the waitlist across Section 21 and Section 29 waivers with a wait of several years. A new Lifespan Waiver aims to eliminate the waitlist within 5 years.',
    waitlistStatus: 'moderate',
    waitlistNote: '2,244 on waitlist | Several years | New Lifespan Waiver in development',
    programs: [
      {
        name: 'Section 21 (Comprehensive) Waiver',
        type: 'medicaid_waiver',
        description: 'Provides comprehensive residential and community support services for adults with intellectual disabilities.',
        eligibility: 'Intellectual disability, Medicaid eligible.',
        howToApply: 'Email HCBS.Waiver@maine.gov or contact OADS.',
        website: 'https://www.maine.gov/dhhs/oads',
      },
      {
        name: 'Section 29 (Community Support) Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community support services for individuals with intellectual disabilities who do not need 24-hour care.',
        eligibility: 'Intellectual disability, Medicaid eligible.',
        howToApply: 'Email HCBS.Waiver@maine.gov.',
      },
    ],
    actionSteps: [
      'Get on the waitlist immediately — email HCBS.Waiver@maine.gov',
      'Apply for SSI to establish Medicaid eligibility',
      'Ask about the new Lifespan Waiver timeline',
      'Contact Disability Rights Maine for advocacy support',
    ],
  },
  {
    state: 'Maryland',
    abbreviation: 'MD',
    overview:
      'Maryland has 3,302 on the waitlist but numbers are declining under the "End the Wait Act" (SB 636, 2022), which mandates a 50% waitlist reduction by FY2028. The former Family Supports and Community Supports waivers were consolidated into Community Pathways in October 2025.',
    waitlistStatus: 'moderate',
    waitlistNote: '3,302 on waitlist | Actively declining under End the Wait Act',
    programs: [
      {
        name: 'Community Pathways Waiver',
        type: 'medicaid_waiver',
        description: 'Maryland\'s consolidated DD waiver (launched October 2025) providing community-based services for individuals with developmental disabilities.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact Maryland DDA (Developmental Disabilities Administration).',
        website: 'https://dda.health.maryland.gov',
      },
    ],
    actionSteps: [
      'Get on the waitlist — numbers are declining under the End the Wait Act',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact Maryland DDA at dda.health.maryland.gov',
      'Contact The Arc of Maryland for advocacy support',
    ],
  },
  {
    state: 'Massachusetts',
    abbreviation: 'MA',
    overview:
      'Massachusetts has NO waitlist for DD services. The Department of Developmental Services (DDS) serves approximately 32,000 individuals with no funding-based waitlist.',
    waitlistStatus: 'none',
    waitlistNote: 'No waitlist — all eligible individuals served',
    programs: [
      {
        name: 'DDS Adult Supports Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive services for adults with developmental disabilities including residential, day, employment, and community support.',
        eligibility: 'Developmental disability (including autism), Massachusetts resident. Apply starting at age 17.',
        howToApply: 'Fill out the DDS Adult Eligibility Application at mass.gov/dds.',
        website: 'https://www.mass.gov/orgs/department-of-developmental-services',
      },
      {
        name: 'Community Living Waiver',
        type: 'medicaid_waiver',
        description: 'Supports individuals with DD in community living settings.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Apply through DDS.',
        website: 'https://www.mass.gov/orgs/department-of-developmental-services',
      },
    ],
    actionSteps: [
      'Apply for DDS eligibility at age 17 — no waitlist means services start after determination',
      'Apply for SSI to establish Medicaid eligibility',
      'Visit mass.gov/dds to start the application',
      'Contact your local DDS regional office',
    ],
  },
  {
    state: 'Michigan',
    abbreviation: 'MI',
    overview:
      'Michigan has an effectively zero waitlist for the Habilitation Supports Waiver. Services are delivered through a network of Community Mental Health (CMH) agencies.',
    waitlistStatus: 'none',
    waitlistNote: 'Effectively no waitlist — minimal wait',
    programs: [
      {
        name: 'Habilitation Supports Waiver (HSW)',
        type: 'medicaid_waiver',
        description: 'Provides community-based habilitation services for adults with developmental disabilities including residential support, day programs, and employment.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local Community Mental Health (CMH) agency.',
        website: 'https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth',
      },
    ],
    actionSteps: [
      'Contact your local CMH agency — minimal wait for services',
      'Apply for SSI to establish Medicaid eligibility',
      'Find your local CMH at michigan.gov/mdhhs',
    ],
  },
  {
    state: 'Minnesota',
    abbreviation: 'MN',
    overview:
      'Minnesota eliminated its DD waiver waitlist in 2016 and has maintained no-waitlist status. Services are delivered through a county-based system. Provider shortages remain a practical challenge.',
    waitlistStatus: 'none',
    waitlistNote: 'Waitlist eliminated in 2016 — no funding-based waitlist',
    programs: [
      {
        name: 'DD Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive community-based services for individuals with developmental disabilities.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your county social services office.',
        website: 'https://mn.gov/dhs/people-we-serve/adults/services/developmental-disabilities',
      },
      {
        name: 'CADI Waiver (Community Alternatives for Disabled Individuals)',
        type: 'medicaid_waiver',
        description: 'Supports individuals with disabilities to live in the community rather than in a nursing facility.',
        eligibility: 'Disability requiring nursing facility level of care, Medicaid eligible.',
        howToApply: 'Contact your county social services office.',
      },
    ],
    actionSteps: [
      'Contact your county social services office — no waitlist',
      'Apply for SSI to establish Medicaid eligibility',
      'Visit mn.gov/dhs for more information',
    ],
  },
  {
    state: 'Mississippi',
    abbreviation: 'MS',
    overview:
      'Mississippi has 2,496–2,772 on the ID/DD Waiver waitlist. Wait times are not publicly reported.',
    waitlistStatus: 'moderate',
    waitlistNote: '~2,500 on waitlist | Wait time not publicly reported',
    programs: [
      {
        name: 'ID/DD Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community-based services for individuals with intellectual and developmental disabilities.',
        eligibility: 'I/DD diagnosis, Medicaid eligible.',
        howToApply: 'Contact your IDD Regional Program or call 1-800-421-2408.',
        phone: '1-800-421-2408',
        website: 'https://www.medicaid.ms.gov/medicaid-coverage/long-term-care/home-and-community-based-services',
      },
    ],
    actionSteps: [
      'Get on the waitlist — call 1-800-421-2408',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact your local IDD Regional Program',
    ],
  },
  {
    state: 'Missouri',
    abbreviation: 'MO',
    overview:
      'Missouri has 1,272 on the waitlist across multiple waivers. Wait times vary by Priority of Need score. Currently ~12,000+ people receive services.',
    waitlistStatus: 'moderate',
    waitlistNote: '1,272 on waitlist | Varies by priority score',
    programs: [
      {
        name: 'Comprehensive Waiver',
        type: 'medicaid_waiver',
        description: 'Provides comprehensive residential and community support services for adults with DD.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your DMH Regional Office or call 800-207-9329.',
        phone: '800-207-9329',
        website: 'https://dmh.mo.gov/dev-disabilities',
      },
      {
        name: 'Partnership for Hope Waiver',
        type: 'medicaid_waiver',
        description: 'Provides limited community support services for individuals with DD who do not need comprehensive services.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your DMH Regional Office or call 800-207-9329.',
        phone: '800-207-9329',
      },
    ],
    actionSteps: [
      'Get on the waitlist — call 800-207-9329',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact your DMH Regional Office',
      'Ask about the Priority of Need scoring system to understand your position',
    ],
  },
  {
    state: 'Montana',
    abbreviation: 'MT',
    overview:
      'Montana has 1,749 on the DD-specific waitlist. The 0208 Comprehensive waiver has an ~7-year wait; the Big Sky waiver has a ~125-day wait.',
    waitlistStatus: 'long',
    waitlistNote: '1,749 on waitlist | ~7 years (0208) | ~125 days (Big Sky)',
    programs: [
      {
        name: '0208 Comprehensive Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive residential and community support services for individuals with DD.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact DDP at 406-444-5978.',
        phone: '406-444-5978',
        website: 'https://dphhs.mt.gov/dsd/developmentaldisabilities',
      },
      {
        name: 'Big Sky Waiver',
        type: 'medicaid_waiver',
        description: 'Provides limited community support services with a much shorter wait (~125 days).',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact DDP at 406-444-5978.',
        phone: '406-444-5978',
      },
    ],
    actionSteps: [
      'Apply for the Big Sky Waiver first — ~125 day wait',
      'Also get on the 0208 Comprehensive waitlist for more comprehensive services',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact DDP at 406-444-5978',
    ],
  },
  {
    state: 'Nebraska',
    abbreviation: 'NE',
    overview:
      'Nebraska eliminated its DD waiver waitlist in June 2025 after a 15-month effort investing $18M+ in state and federal funding. Note: ~46% of families accepted waiver offers; provider shortages remain a practical challenge.',
    waitlistStatus: 'none',
    waitlistNote: 'Waitlist eliminated June 2025',
    programs: [
      {
        name: 'Family Support Waiver (FSW)',
        type: 'medicaid_waiver',
        description: 'Provides up to $10,000/year in family support services for individuals with DD.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact Nebraska DHHS Division of Developmental Disabilities.',
        website: 'https://dhhs.ne.gov/Pages/Developmental-Disabilities.aspx',
      },
      {
        name: 'Comprehensive DD Waiver (CDD)',
        type: 'medicaid_waiver',
        description: 'Comprehensive community-based services for individuals with DD.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact Nebraska DHHS Division of Developmental Disabilities.',
        website: 'https://dhhs.ne.gov/Pages/Developmental-Disabilities.aspx',
      },
    ],
    actionSteps: [
      'Apply for DD waiver services — waitlist eliminated',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact Nebraska DHHS at dhhs.ne.gov',
      'Note: Provider shortages may still delay actual service delivery',
    ],
  },
  {
    state: 'Nevada',
    abbreviation: 'NV',
    overview:
      'Nevada has 582 on the IDD HCBS Waiver waitlist. Wait times are not publicly reported. Currently ~3,100+ people receive services.',
    waitlistStatus: 'short',
    waitlistNote: '582 on waitlist | Wait time not reported',
    programs: [
      {
        name: 'IDD HCBS Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community-based services for individuals with intellectual and developmental disabilities.',
        eligibility: 'I/DD diagnosis, Medicaid eligible.',
        howToApply: 'Contact ADSD Intake at 702-486-7850.',
        phone: '702-486-7850',
        website: 'https://adsd.nv.gov/Programs/Disability/IDD/IDD_Home',
      },
    ],
    actionSteps: [
      'Get on the waitlist — call ADSD at 702-486-7850',
      'Apply for SSI to establish Medicaid eligibility',
    ],
  },
  {
    state: 'New Hampshire',
    abbreviation: 'NH',
    overview:
      'New Hampshire has an effectively zero waitlist for DD services, using a needs-based priority system. Services are delivered through 10 Area Agencies.',
    waitlistStatus: 'none',
    waitlistNote: 'Effectively no waitlist — needs-based priority system',
    programs: [
      {
        name: 'DD Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive community-based services for individuals with developmental disabilities, delivered through 10 Area Agencies.',
        eligibility: 'Developmental disability, Medicaid eligible, NH resident.',
        howToApply: 'Contact your local Area Agency.',
        website: 'https://www.dhhs.nh.gov/programs-services/developmental-and-acquired-brain-disorders',
      },
    ],
    actionSteps: [
      'Contact your local Area Agency — minimal wait',
      'Apply for SSI to establish Medicaid eligibility',
      'Visit dhhs.nh.gov to find your Area Agency',
    ],
  },
  {
    state: 'New Jersey',
    abbreviation: 'NJ',
    overview:
      'New Jersey has 2,700–3,184 on the Community Care Program (CCP) waitlist. However, the Supports Program is available immediately while waiting for CCP.',
    waitlistStatus: 'moderate',
    waitlistNote: '~3,000 on CCP waitlist | Supports Program available immediately',
    programs: [
      {
        name: 'Community Care Program (CCP)',
        type: 'medicaid_waiver',
        description: 'Comprehensive residential and community support services for adults with developmental disabilities.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Email DDD.NJApply@dhs.nj.gov.',
        website: 'https://www.nj.gov/humanservices/ddd',
      },
      {
        name: 'Supports Program',
        type: 'medicaid_waiver',
        description: 'Available immediately (no waitlist). Provides community support services for individuals with DD who live at home.',
        eligibility: 'Developmental disability, Medicaid eligible, living at home.',
        howToApply: 'Email DDD.NJApply@dhs.nj.gov — available immediately.',
      },
    ],
    actionSteps: [
      'Apply for the Supports Program immediately — no waitlist',
      'Also apply for CCP for more comprehensive services',
      'Email DDD.NJApply@dhs.nj.gov to start both applications',
      'Apply for SSI to establish Medicaid eligibility',
    ],
  },
  {
    state: 'New Mexico',
    abbreviation: 'NM',
    overview:
      'New Mexico effectively eliminated its DD waiver waitlist through a "Super Allocation" initiative started in 2021. FY2026 budget funds a sustained no-waitlist policy. Historical wait was 12–16 years.',
    waitlistStatus: 'none',
    waitlistNote: 'DD waitlist effectively eliminated (Super Allocation initiative)',
    programs: [
      {
        name: 'DD Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive community-based services for individuals with developmental disabilities.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact the Pre-Service Intake Bureau at 505-350-0034.',
        phone: '505-350-0034',
        website: 'https://www.nmhealth.org/about/ddsd',
      },
      {
        name: 'Mi Via Self-Directed Waiver',
        type: 'medicaid_waiver',
        description: 'Self-directed waiver allowing individuals to manage their own services and supports.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact the Pre-Service Intake Bureau at 505-350-0034.',
        phone: '505-350-0034',
      },
    ],
    actionSteps: [
      'Apply for DD waiver services — waitlist effectively eliminated',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact Pre-Service Intake at 505-350-0034',
    ],
  },
  {
    state: 'New York',
    abbreviation: 'NY',
    overview:
      'New York has NO waitlist for the DD waiver. OPWDD (Office for People With Developmental Disabilities) serves 100,000–130,000 people. A separate waitlist of 867 exists only for medically fragile children.',
    waitlistStatus: 'none',
    waitlistNote: 'No DD waitlist — 100,000–130,000 served by OPWDD',
    programs: [
      {
        name: 'OPWDD HCBS Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive services for individuals with developmental disabilities including residential, day, employment, and community support. Delivered through OPWDD\'s network of providers.',
        eligibility: 'Developmental disability (including autism), Medicaid eligible.',
        howToApply: 'Contact OPWDD at 1-866-946-9733 or visit opwdd.ny.gov.',
        phone: '1-866-946-9733',
        website: 'https://opwdd.ny.gov',
      },
    ],
    actionSteps: [
      'Contact OPWDD at 1-866-946-9733 — no waitlist',
      'Apply for SSI to establish Medicaid eligibility',
      'Visit opwdd.ny.gov to start the eligibility process',
    ],
  },
  {
    state: 'North Carolina',
    abbreviation: 'NC',
    overview:
      'North Carolina has approximately 18,950 on the Registry of Unmet Needs for the Innovations Waiver, with an average wait of 9.5 years. For families registering today, the projected wait could exceed 20 years.',
    waitlistStatus: 'severe',
    waitlistNote: '~18,950 on waitlist | 9.5 year average | 20+ years for new registrants',
    programs: [
      {
        name: 'Innovations Waiver',
        type: 'medicaid_waiver',
        description: 'Provides comprehensive community-based services for individuals with intellectual and developmental disabilities including residential, day, employment, and behavioral support.',
        eligibility: 'Intellectual or developmental disability, Medicaid eligible.',
        howToApply: 'Contact your Local Management Entity/Managed Care Organization (LME/MCO) or call 1-855-262-1946.',
        phone: '1-855-262-1946',
        website: 'https://www.ncdhhs.gov/divisions/mental-health-developmental-disabilities-and-substance-use-services',
      },
    ],
    actionSteps: [
      'Register for the Innovations Waiver TODAY — 20+ year wait for new registrants',
      'Call 1-855-262-1946 immediately',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact The Arc of NC for advocacy support',
      'Open an ABLE account and consider a Special Needs Trust for long-term planning',
    ],
  },
  {
    state: 'North Dakota',
    abbreviation: 'ND',
    overview:
      'North Dakota has a short waitlist of only 141 across all HCBS programs (52 on the ASD waiver specifically). The traditional IID/DD waiver has minimal wait.',
    waitlistStatus: 'short',
    waitlistNote: '141 total on waitlist | Short wait',
    programs: [
      {
        name: 'IID/DD HCBS Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community-based services for individuals with intellectual and developmental disabilities.',
        eligibility: 'I/DD diagnosis, Medicaid eligible.',
        howToApply: 'Contact the DD Section at 701-328-8930 or 800-755-8529.',
        phone: '701-328-8930',
        website: 'https://www.hhs.nd.gov/disability/developmental-disabilities',
      },
      {
        name: 'Autism Spectrum Disorder (ASD) Waiver',
        type: 'medicaid_waiver',
        description: 'Dedicated waiver for individuals with autism spectrum disorder. 52 currently on waitlist.',
        eligibility: 'Autism diagnosis, Medicaid eligible.',
        howToApply: 'Contact the DD Section at 701-328-8930.',
        phone: '701-328-8930',
      },
    ],
    actionSteps: [
      'Apply for waiver services — short wait',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact ND HHS DD Section at 701-328-8930',
    ],
  },
  {
    state: 'Ohio',
    abbreviation: 'OH',
    overview:
      'Ohio has 1,887 on the waitlist across three waivers. Wait times vary by county. Currently ~71,000 people receive services across the three waivers.',
    waitlistStatus: 'short',
    waitlistNote: '1,887 on waitlist | Varies by county',
    programs: [
      {
        name: 'Individual Options (IO) Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive services for individuals with DD including residential, day, employment, and behavioral support.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your County Board of DD or call 800-617-6733.',
        phone: '800-617-6733',
        website: 'https://dodd.ohio.gov',
      },
      {
        name: 'Level One Waiver',
        type: 'medicaid_waiver',
        description: 'Provides limited community support services for individuals with DD who do not need comprehensive services.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your County Board of DD.',
      },
      {
        name: 'SELF Waiver',
        type: 'medicaid_waiver',
        description: 'Self-directed waiver allowing individuals to manage their own services.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your County Board of DD.',
      },
    ],
    actionSteps: [
      'Contact your County Board of DD — varies by county',
      'Apply for SSI to establish Medicaid eligibility',
      'Call 800-617-6733 to find your County Board',
    ],
  },
  {
    state: 'Oklahoma',
    abbreviation: 'OK',
    overview:
      'Oklahoma dramatically reduced its DD waiver wait from 13 years to approximately 1 year. Of 6,300 who applied before October 2023, more than 2,600 are now receiving services.',
    waitlistStatus: 'short',
    waitlistNote: '~1,781 on waitlist | ~1 year wait (down from 13 years)',
    programs: [
      {
        name: 'Community Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive community-based services for adults with developmental disabilities.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your DDS Area Office.',
        website: 'https://oklahoma.gov/okdhs/services/developmental-disabilities.html',
      },
      {
        name: 'In-Home Supports Waiver (IHSW)',
        type: 'medicaid_waiver',
        description: 'Supports individuals with DD to remain in their family home.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your DDS Area Office.',
      },
    ],
    actionSteps: [
      'Apply for waiver services — wait reduced to ~1 year',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact your local DDS Area Office',
    ],
  },
  {
    state: 'Oregon',
    abbreviation: 'OR',
    overview:
      'Oregon has NO waitlist for DD services — it has maintained no-waitlist status since a 2000 lawsuit settlement. About 11,000 people receive services across five waivers.',
    waitlistStatus: 'none',
    waitlistNote: 'No waitlist since 2000 lawsuit settlement',
    programs: [
      {
        name: 'Comprehensive DD Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive services for individuals with DD including residential, day, employment, and community support.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local Support Services Brokerage or Developmental Disability Services.',
        website: 'https://www.oregon.gov/odhs/dd/pages/index.aspx',
      },
      {
        name: 'Support Services Waiver',
        type: 'medicaid_waiver',
        description: 'Community support services for individuals with DD who do not need 24-hour care.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local Support Services Brokerage.',
      },
    ],
    actionSteps: [
      'Apply for DD services — no waitlist since 2000',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact Oregon ODHS DD at oregon.gov/odhs/dd',
    ],
  },
  {
    state: 'Pennsylvania',
    abbreviation: 'PA',
    overview:
      'Pennsylvania has 12,604 on the waitlist with a 7+ year wait. The state uses a PUNS system to triage across four waivers. More than 10,000 people are categorized as having Emergency or Critical needs.',
    waitlistStatus: 'severe',
    waitlistNote: '12,604 on waitlist | 7+ year wait | 10,000+ in Emergency/Critical categories',
    programs: [
      {
        name: 'Consolidated Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive residential and community support services for adults with DD.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your County MH/ID Office or ODP at 1-888-565-9435.',
        phone: '1-888-565-9435',
        website: 'https://www.dhs.pa.gov/Services/Disabilities-Special-Needs/Pages/ODP.aspx',
      },
      {
        name: 'Adult Autism Waiver',
        type: 'medicaid_waiver',
        description: 'Dedicated waiver for adults with autism spectrum disorder.',
        eligibility: 'Autism diagnosis, adult, Medicaid eligible.',
        howToApply: 'Contact your County MH/ID Office or ODP at 1-888-565-9435.',
        phone: '1-888-565-9435',
      },
      {
        name: 'Community Living Waiver',
        type: 'medicaid_waiver',
        description: 'Supports individuals with DD in community living settings.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your County MH/ID Office.',
      },
    ],
    actionSteps: [
      'Register in the PUNS system immediately — contact your County MH/ID Office',
      'Apply for SSI to establish Medicaid eligibility',
      'Call ODP at 1-888-565-9435',
      'Ask about the Adult Autism Waiver specifically',
      'Open an ABLE account and consider a Special Needs Trust',
    ],
  },
  {
    state: 'Rhode Island',
    abbreviation: 'RI',
    overview:
      'Rhode Island has NO formal waitlist through its 1115 Global Waiver. However, a severe Direct Support Professional shortage means 33% of providers were still turning away people due to staffing in 2024.',
    waitlistStatus: 'none',
    waitlistNote: 'No formal waitlist | Provider shortages may delay services',
    programs: [
      {
        name: '1115 Global Waiver',
        type: 'medicaid_waiver',
        description: 'Rhode Island\'s comprehensive Medicaid waiver covering a broad range of community-based services for individuals with DD.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact BHDDH (Behavioral Healthcare, Developmental Disabilities and Hospitals) at 401-462-3201.',
        phone: '401-462-3201',
        website: 'https://bhddh.ri.gov/developmental-disabilities',
      },
    ],
    actionSteps: [
      'Apply for services — no formal waitlist',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact BHDDH at 401-462-3201',
      'Be aware of provider shortages — may need to search for available providers',
    ],
  },
  {
    state: 'South Carolina',
    abbreviation: 'SC',
    overview:
      'South Carolina has the second-largest interest list in the nation at 37,139. However, SC does not screen for eligibility before placement, so actual eligible numbers are lower. Wait times are not reported.',
    waitlistStatus: 'severe',
    waitlistNote: '37,139 on interest list (unscreened) | Wait time not reported',
    programs: [
      {
        name: 'ID/RD Waiver',
        type: 'medicaid_waiver',
        description: 'Comprehensive services for individuals with intellectual/related disabilities.',
        eligibility: 'Intellectual or related disability, Medicaid eligible.',
        howToApply: 'Contact your local OIDD Board (formerly DSN Board) or call 1-800-289-7012.',
        phone: '1-800-289-7012',
        website: 'https://ddsn.sc.gov',
      },
      {
        name: 'Community Supports Waiver',
        type: 'medicaid_waiver',
        description: 'Community support services for individuals with DD.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local OIDD Board or call 1-800-289-7012.',
        phone: '1-800-289-7012',
      },
    ],
    actionSteps: [
      'Get on the interest list immediately — call 1-800-289-7012',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact your local OIDD Board',
      'Open an ABLE account and consider a Special Needs Trust for long-term planning',
    ],
  },
  {
    state: 'South Dakota',
    abbreviation: 'SD',
    overview:
      'South Dakota has 185 on the CHOICES waiver waitlist with a 1–2 year wait.',
    waitlistStatus: 'short',
    waitlistNote: '185 on waitlist | 1–2 year wait',
    programs: [
      {
        name: 'CHOICES Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community-based services for individuals with developmental disabilities.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Call 605-773-3438 or 800-265-9684.',
        phone: '605-773-3438',
        website: 'https://dss.sd.gov/disabilityservices',
      },
    ],
    actionSteps: [
      'Get on the waitlist — 1–2 year wait',
      'Apply for SSI to establish Medicaid eligibility',
      'Call 605-773-3438',
    ],
  },
  {
    state: 'Tennessee',
    abbreviation: 'TN',
    overview:
      'Tennessee has 2,182–2,500 on the ECF CHOICES waitlist. The Governor proposed $36M to serve 2,500 more people.',
    waitlistStatus: 'moderate',
    waitlistNote: '~2,200 on waitlist | Wait time not reported',
    programs: [
      {
        name: 'ECF CHOICES (Employment and Community First)',
        type: 'medicaid_waiver',
        description: 'Tennessee\'s DD waiver focused on employment and community integration for individuals with developmental disabilities.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Complete the TennCare Self-Referral Form or contact the Department of Disability and Aging.',
        website: 'https://www.tn.gov/disability',
      },
    ],
    actionSteps: [
      'Complete the TennCare Self-Referral Form at tn.gov/disability',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact the Tennessee Department of Disability and Aging',
    ],
  },
  {
    state: 'Texas',
    abbreviation: 'TX',
    overview:
      'Texas has the largest DD waiver interest list in the nation — 181,697+ people. The HCS waiver alone has nearly 68,000 on its list. Texas does not screen for eligibility before placement. The wait is 5–15 years.',
    waitlistStatus: 'severe',
    waitlistNote: '181,697+ on interest lists | 5–15 year wait | Largest in the nation',
    programs: [
      {
        name: 'Home and Community-based Services (HCS) Waiver',
        type: 'medicaid_waiver',
        description: 'Texas\'s primary DD waiver providing residential, day, employment, and community support services.',
        eligibility: 'Intellectual disability or related condition, Medicaid eligible.',
        howToApply: 'Contact your Local IDD Authority (LIDDA).',
        website: 'https://www.hhs.texas.gov/services/disability/long-term-care-services-supports-people-disabilities',
      },
      {
        name: 'Community Living Assistance and Support Services (CLASS)',
        type: 'medicaid_waiver',
        description: 'Provides in-home support services for individuals with related conditions (including autism).',
        eligibility: 'Related condition (autism qualifies), Medicaid eligible.',
        howToApply: 'Call HHSC at 1-877-438-5658.',
        phone: '1-877-438-5658',
      },
      {
        name: 'Texas Home Living (TxHmL) Waiver',
        type: 'medicaid_waiver',
        description: 'Provides limited community support services for individuals with ID/DD living at home.',
        eligibility: 'Intellectual disability or related condition, Medicaid eligible.',
        howToApply: 'Contact your Local IDD Authority (LIDDA).',
      },
      {
        name: 'Medically Dependent Children Program (MDCP)',
        type: 'medicaid_waiver',
        description: 'Supports medically dependent children with disabilities to remain at home.',
        eligibility: 'Child with medical needs, Medicaid eligible.',
        howToApply: 'Call HHSC at 1-877-438-5658.',
        phone: '1-877-438-5658',
      },
    ],
    actionSteps: [
      'Get on ALL applicable waitlists TODAY — you can be on multiple lists simultaneously',
      'Contact your Local IDD Authority (LIDDA) for HCS and TxHmL',
      'Call HHSC at 1-877-438-5658 for CLASS, DBMD, and MDCP',
      'Apply for SSI to establish Medicaid eligibility',
      'Open an ABLE account and establish a Special Needs Trust — 5–15 year wait means you need a financial plan',
      'Contact The Arc of Texas for advocacy support',
    ],
  },
  {
    state: 'Utah',
    abbreviation: 'UT',
    overview:
      'Utah has 4,153–12,096 on the waitlist (sources vary) with a 5.4-year average wait. Currently 7,157 people receive services.',
    waitlistStatus: 'long',
    waitlistNote: '~12,000 on waitlist | 5.4 year average wait',
    programs: [
      {
        name: 'Community Supports Waiver',
        type: 'medicaid_waiver',
        description: 'Provides comprehensive community-based services for individuals with developmental disabilities.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact DSPD at 1-877-568-0084.',
        phone: '1-877-568-0084',
        website: 'https://dspd.utah.gov',
      },
      {
        name: 'Limited Supports Waiver',
        type: 'medicaid_waiver',
        description: 'Provides limited community support services for individuals with DD.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact DSPD at 1-877-568-0084.',
        phone: '1-877-568-0084',
      },
    ],
    actionSteps: [
      'Get on the waitlist — contact DSPD at 1-877-568-0084',
      'Apply for SSI to establish Medicaid eligibility',
      'Open an ABLE account for savings while waiting',
    ],
  },
  {
    state: 'Vermont',
    abbreviation: 'VT',
    overview:
      'Vermont is an entitlement state — all eligible individuals have a legal right to services through the 1115 Global Commitment waiver. Currently 4,731 people are served.',
    waitlistStatus: 'none',
    waitlistNote: 'Entitlement state — legal right to services',
    programs: [
      {
        name: '1115 Global Commitment Waiver',
        type: 'medicaid_waiver',
        description: 'Vermont\'s comprehensive Medicaid waiver providing services for individuals with developmental disabilities as an entitlement.',
        eligibility: 'Developmental disability, Vermont resident.',
        howToApply: 'Contact the Vermont Division of Disability and Aging Services.',
        website: 'https://dail.vermont.gov/divisions/developmental-services',
      },
    ],
    actionSteps: [
      'Apply for services — entitlement state, legal right to services',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact Vermont DAIL at dail.vermont.gov',
    ],
  },
  {
    state: 'Virginia',
    abbreviation: 'VA',
    overview:
      'Virginia has 14,168–15,472 on the waitlist across three DD waivers. The 2024 General Assembly approved 3,440 new slots — the largest single increase in state history.',
    waitlistStatus: 'severe',
    waitlistNote: '~15,000 on waitlist | Years (varies by priority) | 3,440 new slots approved',
    programs: [
      {
        name: 'Building Independence (BI) Waiver',
        type: 'medicaid_waiver',
        description: 'Provides limited community support services for individuals with DD who are relatively independent.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local Community Services Board (CSB).',
        website: 'https://www.dbhds.virginia.gov/individuals-and-families/developmental-services',
      },
      {
        name: 'Family and Individual Supports (FIS) Waiver',
        type: 'medicaid_waiver',
        description: 'Provides moderate community support services for individuals with DD living with family.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local Community Services Board (CSB).',
      },
      {
        name: 'Community Living (CL) Waiver',
        type: 'medicaid_waiver',
        description: 'Provides comprehensive residential and community support services for individuals with DD.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local Community Services Board (CSB).',
      },
    ],
    actionSteps: [
      'Contact your local Community Services Board (CSB) immediately',
      'Apply for SSI to establish Medicaid eligibility',
      'Ask about Priority 1 status if there is an urgent need',
      'Contact The Arc of Virginia for advocacy support',
    ],
  },
  {
    state: 'Washington',
    abbreviation: 'WA',
    overview:
      'Washington has an effectively zero formal waitlist with ~41,000 people in paid services. Services are delivered through DDA (Developmental Disabilities Administration).',
    waitlistStatus: 'none',
    waitlistNote: 'Minimal formal wait — ~41,000 in paid services',
    programs: [
      {
        name: 'Individual and Family Services (IFS) Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community support services for individuals with developmental disabilities.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local DDA office.',
        website: 'https://www.dshs.wa.gov/dda',
      },
      {
        name: 'Basic Plus Waiver',
        type: 'medicaid_waiver',
        description: 'Provides basic community support services for individuals with DD.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local DDA office.',
      },
      {
        name: 'Core Waiver',
        type: 'medicaid_waiver',
        description: 'Provides core community support services for individuals with DD.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact your local DDA office.',
      },
    ],
    actionSteps: [
      'Contact your local DDA office — minimal wait',
      'Apply for SSI to establish Medicaid eligibility',
      'Visit dshs.wa.gov/dda',
    ],
  },
  {
    state: 'West Virginia',
    abbreviation: 'WV',
    overview:
      'West Virginia has 1,031 on the I/DD Waiver waitlist. The waitlist doubled in 18 months; 76% are children. A Waitlist Support Grant is available while waiting.',
    waitlistStatus: 'moderate',
    waitlistNote: '1,031 on waitlist | 76% are children | Waitlist doubled in 18 months',
    programs: [
      {
        name: 'I/DD Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community-based services for individuals with intellectual and developmental disabilities.',
        eligibility: 'I/DD diagnosis, Medicaid eligible.',
        howToApply: 'Contact Acentra Health at 304-356-4904 or WVIDDWaiver@acentra.com.',
        phone: '304-356-4904',
        website: 'https://dhhr.wv.gov/bhhf/Pages/Intellectual-Developmental-Disabilities.aspx',
      },
    ],
    actionSteps: [
      'Get on the waitlist — contact Acentra Health at 304-356-4904',
      'Ask about the Waitlist Support Grant available while waiting',
      'Apply for SSI to establish Medicaid eligibility',
    ],
  },
  {
    state: 'Wisconsin',
    abbreviation: 'WI',
    overview:
      'Wisconsin is an entitlement state for adults — Family Care and IRIS programs have no waitlist. For children, the CLTS waiver has fewer than 1,000 waiting with an average wait of ~70 days (down from 3 years in 2017).',
    waitlistStatus: 'none',
    waitlistNote: 'Adults: entitlement, no waitlist | Children: ~70 day wait',
    programs: [
      {
        name: 'Family Care (adults)',
        type: 'medicaid_waiver',
        description: 'Wisconsin\'s entitlement program for adults with developmental disabilities. Provides comprehensive community-based services with no waitlist.',
        eligibility: 'Developmental disability, Medicaid eligible, adult.',
        howToApply: 'Contact your local Aging and Disability Resource Center (ADRC).',
        website: 'https://www.dhs.wisconsin.gov/familycare',
      },
      {
        name: 'IRIS (Include, Respect, I Self-Direct)',
        type: 'medicaid_waiver',
        description: 'Self-directed alternative to Family Care for adults with DD.',
        eligibility: 'Developmental disability, Medicaid eligible, adult.',
        howToApply: 'Contact your local ADRC.',
        website: 'https://www.dhs.wisconsin.gov/iris',
      },
      {
        name: "Children's Long-Term Support (CLTS) Waiver",
        type: 'medicaid_waiver',
        description: 'Provides community support services for children with developmental disabilities. ~70 day average wait.',
        eligibility: 'Developmental disability, Medicaid eligible, under 18.',
        howToApply: 'Contact your local ADRC.',
      },
    ],
    actionSteps: [
      'Contact your local ADRC — adults have no waitlist',
      'For children, apply for CLTS — ~70 day wait',
      'Apply for SSI to establish Medicaid eligibility',
      'Find your ADRC at dhs.wisconsin.gov',
    ],
  },
  {
    state: 'Wyoming',
    abbreviation: 'WY',
    overview:
      'Wyoming has 282 on the waitlist with a 1–3 year wait for adults.',
    waitlistStatus: 'short',
    waitlistNote: '282 on waitlist | 1–3 year wait',
    programs: [
      {
        name: 'Comprehensive Waiver',
        type: 'medicaid_waiver',
        description: 'Provides comprehensive community-based services for individuals with developmental disabilities.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact the HCBS Section at health.wyo.gov.',
        website: 'https://health.wyo.gov/healthcarefin/hcbs',
      },
      {
        name: 'Supports Waiver',
        type: 'medicaid_waiver',
        description: 'Provides limited community support services for individuals with DD.',
        eligibility: 'Developmental disability, Medicaid eligible.',
        howToApply: 'Contact the HCBS Section at health.wyo.gov.',
      },
    ],
    actionSteps: [
      'Get on the waitlist — 1–3 year wait',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact Wyoming HCBS at health.wyo.gov',
    ],
  },
  {
    state: 'Washington DC',
    abbreviation: 'DC',
    overview:
      'DC activated its first-ever DD waiver waitlist on October 1, 2025 due to FY2026 budget cuts. The IFS waiver remains open, but the IDD waiver now has an active waitlist. Apply immediately if not yet enrolled.',
    waitlistStatus: 'moderate',
    waitlistNote: 'New waitlist activated October 2025 | Apply immediately',
    programs: [
      {
        name: 'IDD Waiver',
        type: 'medicaid_waiver',
        description: 'Provides comprehensive services for individuals with intellectual and developmental disabilities in DC.',
        eligibility: 'I/DD diagnosis, Medicaid eligible, DC resident.',
        howToApply: 'Contact DDS (Department on Disability Services) at 202-730-1700.',
        phone: '202-730-1700',
        website: 'https://dds.dc.gov',
      },
      {
        name: 'Individual and Family Supports (IFS) Waiver',
        type: 'medicaid_waiver',
        description: 'Provides community support services for individuals with DD. Currently open with no waitlist.',
        eligibility: 'Developmental disability, Medicaid eligible, DC resident.',
        howToApply: 'Contact DDS at 202-730-1700 — IFS waiver currently open.',
        phone: '202-730-1700',
      },
    ],
    actionSteps: [
      'Apply for IFS waiver immediately — currently open with no waitlist',
      'Apply for IDD waiver as well — new waitlist just activated',
      'Apply for SSI to establish Medicaid eligibility',
      'Contact DDS at 202-730-1700',
    ],
  },
];

// Helper: get state data by abbreviation
export function getStateData(abbreviation: string): StateLTDData | undefined {
  return STATE_LTD_DATA.find(
    (s) => s.abbreviation.toUpperCase() === abbreviation.toUpperCase()
  );
}

// Helper: get waitlist status label
export function getWaitlistLabel(status: StateLTDData['waitlistStatus']): string {
  switch (status) {
    case 'none': return 'No Waitlist';
    case 'short': return 'Short Wait';
    case 'moderate': return 'Moderate Wait';
    case 'long': return 'Long Wait';
    case 'severe': return 'Severe Wait';
  }
}

// Helper: get waitlist color
export function getWaitlistColor(status: StateLTDData['waitlistStatus']): string {
  switch (status) {
    case 'none': return '#22c55e';    // green
    case 'short': return '#84cc16';   // lime
    case 'moderate': return '#f59e0b'; // amber
    case 'long': return '#f97316';    // orange
    case 'severe': return '#ef4444';  // red
  }
}
