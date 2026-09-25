/**
 * Singapore 2030-2035 Eldercare Foresight & Early Warning Indicator Engine
 * Analyzes international long-term-care (LTC) and ageing-in-place expansions
 * (Japan, UK, Germany, Nordics) and projects systemic early warning indicators
 * for Singapore's 2030-2035 super-aged demographic transition.
 */

export const INTERNATIONAL_EXPANSION_LESSONS = [
  {
    country: 'Japan',
    policy_reform: 'Universal Long-Term Care Insurance (LTCI) & Community Comprehensive Care Centers (Chiiki-Hokatsu)',
    unintended_consequence: 'Surge in family caregiver job turnover ("kaigo-ri-shoku" ~100k workers quitting annually to care for parents) and institutional bed waiting lists despite community emphasis.',
    early_warning_metric: 'Old-age support ratio drops below 2.0; proportion of working-age adults spending >20 hrs/week on unpaid eldercare.',
    relevance_to_singapore: 'Singapore’s shrinking family nucleus means reliance on working children or single foreign domestic workers (FDWs) will become untenable without structured respite networks.'
  },
  {
    country: 'United Kingdom (NHS & Social Care)',
    policy_reform: 'Expansion of home care packages to avoid hospital admissions ("Discharge to Assess")',
    unintended_consequence: 'Severe fragmentation between NHS acute trusts and local council social care; emergency readmissions rose for avoidable ambulatory care conditions (falls, dehydration, UTI) due to low aide training.',
    early_warning_metric: '30-day readmission rate for frail elders >18%; ambulance ramping and ED attendances for non-acute social breakdown.',
    relevance_to_singapore: 'Crucial for Singapore’s MOH Healthier SG and AIC network to prevent disjointed handoffs between acute hospitals (e.g. SGH, NUH, TTSH) and Community Care Organisations.'
  },
  {
    country: 'Nordic Countries (Sweden / Denmark)',
    policy_reform: 'De-institutionalization into municipal home care and assistive technology',
    unintended_consequence: 'Hidden social isolation and loneliness among elderly living alone in private apartments; rapid functional decline when isolated episodes went unnoticed.',
    early_warning_metric: 'Percentage of seniors living alone >30%; solitary deaths ("kodokushi" equivalents) and late-stage hospital transfers.',
    relevance_to_singapore: 'High density HDB living creates vertical isolation; Active Ageing Centres (AACs 2.0) must shift from passive walk-in to proactive micro-neighborhood outreach.'
  },
  {
    country: 'Germany',
    policy_reform: 'Pflegeversicherung (Long-Term Care Social Insurance) offering cash-for-care vs in-kind services',
    unintended_consequence: '80% of families initially chose cash benefits, leading to an unregulated informal gray care market with low clinical oversight and severe caregiver physical injury.',
    early_warning_metric: 'Proportion of informal caregivers experiencing chronic depression and musculoskeletal disorders >45%.',
    relevance_to_singapore: 'Home Caregiving Grant (HCG) cash subsidies must be paired with mandatory caregiver training, ergonomic equipment subsidies, and clinical respite credits.'
  }
];

export const SINGAPORE_EARLY_WARNING_INDICATORS = [
  {
    id: 'ew-1',
    metric: 'Citizen Old-Age Support Ratio (Working-age adults per senior 65+)',
    category: 'Demographic Ratio',
    baseline_2020: '4.0 working adults per senior',
    projected_2030: '2.7 working adults per senior',
    projected_2035: '2.0 working adults per senior',
    warning_threshold: '< 2.5 working adults',
    singapore_implication: 'Family caregiver pool halves; traditional informal family eldercare model collapses as total fertility rate remains below 1.0.',
    mitigation_strategy: 'Scale AIC Community Care Networks, micro-cooperative caregiving pods, and AI-enabled ambient passive sensor monitoring in HDB blocks.'
  },
  {
    id: 'ew-2',
    metric: 'Projected Dementia Caseload in Singapore',
    category: 'Healthcare Utilization',
    baseline_2020: '~100,000 seniors',
    projected_2030: '~152,000 seniors',
    projected_2035: '>180,000 seniors',
    warning_threshold: '>140,000 active cases',
    singapore_implication: 'Enormous strain on day care and memory centers; wandering and behavioral agitation triggering avoidable acute hospitalizations.',
    mitigation_strategy: 'Dementia-friendly neighborhood infrastructure, acoustic vocal biomarker screening at polyclinics, and intergenerational day hubs.'
  },
  {
    id: 'ew-3',
    metric: 'Seniors Living Alone in HDB Estates',
    category: 'Social Vulnerability',
    baseline_2020: '~67,000 seniors',
    projected_2030: '~100,000+ seniors',
    projected_2035: '~140,000 seniors',
    warning_threshold: '>90,000 solitary seniors',
    singapore_implication: 'Severe vulnerability to unobserved falls, medication non-adherence, malnutrition, and acute depressive episodes in high-rise flats.',
    mitigation_strategy: 'Mandatory Active Ageing Centre (AAC) catchment assignment, Silver Generation Ambassadors (SGA) frequent check-ins, and door-sensor alerts.'
  },
  {
    id: 'ew-4',
    metric: 'Informal Family Caregiver Burnout & Depression Rate',
    category: 'Caregiver Strain',
    baseline_2020: '32% reporting severe burden',
    projected_2030: '48% projected',
    projected_2035: '>55% projected',
    warning_threshold: '>40% experiencing clinical burnout',
    singapore_implication: 'Economic productivity loss as middle-aged dual-income professionals ("sandwich generation") drop out of Singapore’s workforce.',
    mitigation_strategy: 'Flexible workplace eldercare leave, AIC night respite subsidies, digital mental wellness circles, and assistive transfer exosuits.'
  },
  {
    id: 'ew-5',
    metric: 'Ambulatory Care Sensitive Conditions (ACSC) Emergency Department Attendances',
    category: 'Healthcare Utilization',
    baseline_2020: '14.2% of senior ED visits',
    projected_2030: '21.5% projected',
    projected_2035: '>26.0% projected',
    warning_threshold: '>18% of geriatric ED admissions',
    singapore_implication: 'Emergency departments at public hospitals (SGH, CGH, TTSH, KTPH) choked with non-emergency elder social/chronic exacerbations.',
    mitigation_strategy: 'Mobile urgent care teams deployed by community hospitals; 24/7 tele-triage dispatch directly to primary care & home nursing.'
  }
];

export const STAKEHOLDER_MATRIX = [
  {
    id: 'sh-moh',
    name: 'Ministry of Health (MOH)',
    role: 'Apex Health Policy & Healthcare Financing',
    key_interests: [
      'National healthcare budget sustainability under super-aged demographic',
      'Preventing acute hospital bed gridlock (Healthier SG & Age Well SG)',
      'Subsidies governance (MediSave, MediShield Life, CareShield Life, ElderShield)'
    ],
    systemic_risks_faced: [
      'Cost escalation outpacing GDP growth',
      'Healthcare workforce recruitment bottlenecks',
      'Disparities in health equity across socioeconomic tiers'
    ],
    engagement_status: 'Active Planning',
    recommended_actions_2030: [
      'Shift financing from volume-based to capitation value-based community packages',
      'Mandate interoperable electronic health records (NEHR) across all community care partners',
      'Incentivize preventive longevity biomarkers in polyclinic health screenings'
    ]
  },
  {
    id: 'sh-aic',
    name: 'Agency for Integrated Care (AIC)',
    role: 'National Eldercare Coordinator & Sector Integrator',
    key_interests: [
      'Seamless coordination between acute hospitals, community care, and social care',
      'Active Ageing Centre (AAC) 2.0 operating model rollout',
      'Silver Generation Office outreach to all vulnerable seniors',
      'Caregiver training and Home Caregiving Grant administration'
    ],
    systemic_risks_faced: [
      'Caregiver burnout causing home-care breakdowns',
      'Uneven capability across voluntary welfare organisations (VWOs)',
      'Digital literacy barriers among oldest-old'
    ],
    engagement_status: 'Operational Scaling',
    recommended_actions_2030: [
      'Deploy predictive risk scoring to prioritize proactive home visits',
      'Expand night-respite and weekend daycare facilities island-wide',
      'Standardize caregiver competence credentials and rapid-hire pipelines'
    ]
  },
  {
    id: 'sh-cco',
    name: 'Community Care Organisations (CCOs / VWOs)',
    role: 'Frontline Service Providers (Day Care, Home Nursing, Meals, AACs)',
    key_interests: [
      'Direct client well-being and local neighborhood trust',
      'Care staff recruitment and retention (nurses, therapy aides, social workers)',
      'Sustainable operating funding models from government grants and donations'
    ],
    systemic_risks_faced: [
      'Chronic shortage of qualified healthcare aides',
      'Complex clients with multi-morbidities exceeding standard social care skills',
      'Administrative reporting overhead diverting time from direct care'
    ],
    engagement_status: 'Active Planning',
    recommended_actions_2030: [
      'Adopt assistive transfer equipment and AI documentation assistants',
      'Establish inter-agency micro-clusters to share relief workers',
      'Partner with schools and corporations for volunteer respite companionship'
    ]
  },
  {
    id: 'sh-hpt',
    name: 'Healthcare Planning & Regional Health Systems (SingHealth, NHG, NUHS)',
    role: 'Regional Integrated Care Anchors',
    key_interests: [
      'Right-siting care from acute hospitals to primary and community care',
      'Population health management in regional catchments',
      'Reducing 30-day readmissions and ED boarding times'
    ],
    systemic_risks_faced: [
      'Spillover of social care failures into acute hospital beds',
      'Information silos preventing timely patient discharge',
      'Delayed intervention for frailty and cognitive decline'
    ],
    engagement_status: 'Policy Consultation',
    recommended_actions_2030: [
      'Embed community nurses inside every HDB neighborhood precinct',
      'Establish hospital-at-home acute alternatives for stabilized seniors',
      'Develop real-time capacity dashboards linking community beds and acute wards'
    ]
  }
];

export const STRATEGIC_RISK_ANALYSIS = [
  {
    risk: 'Information Relevance & Noise (Lifestyle vs Clinical Drivers)',
    impact: 'Planners overwhelmed with consumer lifestyle data that fails to predict real clinical or functional dependency breakdowns.',
    mitigation: 'Triangulate signals with hard clinical endpoints from PubMed and macroeconomic dependency data from OECD/WHO; focus on ADL/IADL impairment drivers rather than wellness trends.'
  },
  {
    risk: 'Differing Access to Healthcare (Health Equity & Social Gradients)',
    impact: 'Lower-income or non-digitally savvy seniors slip through community safety nets, presenting only in end-stage acute collapse.',
    mitigation: 'Universal baseline outreach via Silver Generation Ambassadors visiting every senior unit; zero-barrier walk-in AACs with subsidised meals and bilingual navigators.'
  },
  {
    risk: 'Caregiver Workforce Depletion',
    impact: 'Inability to hire enough local or foreign eldercare aides leads to institutional rationing and unassisted falls at home.',
    mitigation: 'Technological augmentation (soft robotics, ambient radar sensors), wage restructuring, and formal accreditation pathways for senior peer-caregivers.'
  }
];
