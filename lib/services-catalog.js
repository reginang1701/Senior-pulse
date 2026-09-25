/**
 * Current Services for Seniors Catalog & Horizon Scan Matrix
 * Baseline directory of eldercare services, emerging trends, and weak signals
 */

export const CURRENT_SENIOR_SERVICES = [
  {
    id: 'svc-home-care',
    category: 'Home & Community-Based Services',
    title: 'In-Home Personal Care & Nursing Aides',
    description: 'Direct assistance with Activities of Daily Living (ADLs) including bathing, dressing, meal prep, and medication management in private residences.',
    target_cohort: 'Frail seniors with physical limitations wanting to age in place',
    delivery_channel: 'In-Person / Home',
    current_challenges: [
      'Severe caregiver workforce shortages',
      'High turnover rates (>65%)',
      'Unpredictable scheduling and caregiver burnout'
    ],
    emerging_signals: [
      'AI scheduling & route optimization algorithms',
      'Smart home ambient sensor monitoring without cameras',
      'Cooperative micro-caregiving networks'
    ],
    future_opportunity: 'Hybrid caregiver-assistive sensor pods that predict falls and automate dispatch before acute crises.'
  },
  {
    id: 'svc-memory-care',
    category: 'Cognitive & Behavioral Health',
    title: 'Adult Day Memory Hubs & Respite Centers',
    description: 'Daytime therapeutic environments offering cognitive stimulation therapy, structured socialization, and sensory rooms for persons living with dementia.',
    target_cohort: 'Seniors with mild-to-moderate Alzheimer’s disease and their family caregivers',
    delivery_channel: 'Facility / Community',
    current_challenges: [
      'Limited geographic coverage in rural/suburban areas',
      'Caregiver stigma and late-stage enrollment',
      'High out-of-pocket costs not fully covered by basic insurance'
    ],
    emerging_signals: [
      'VR/AR reminiscence therapy simulations',
      'Bio-marker acoustic speech analysis for early decline detection',
      'Intergenerational learning day centers combined with preschools'
    ],
    future_opportunity: 'Intergenerational social clubs integrating cognitive neuro-gaming and real-time family caregiver wellness tracking.'
  },
  {
    id: 'svc-telegeriatrics',
    category: 'Clinical & Remote Healthcare',
    title: 'Virtual Geriatric Consults & Remote Vitals Monitoring',
    description: 'Telemedicine checkups with geriatricians, polypharmacy medication reviews, and cellular-connected blood pressure/glucose monitors.',
    target_cohort: 'Homebound elderly patients with multiple chronic non-communicable conditions',
    delivery_channel: 'Digital / Hybrid',
    current_challenges: [
      'Digital literacy barriers and small touchscreens',
      'Fragmented data silos between primary care and specialists',
      'Lack of physical palpation for frailty assessment'
    ],
    emerging_signals: [
      'Voice-first conversational agents with zero UI',
      'Passive radar-based respiratory and sleep quality monitoring',
      'Smart pill blisters with cellular event reporting'
    ],
    future_opportunity: 'Zero-touch voice interfaces that conduct daily wellness check-ins, detect subtle vocal biomarkers of depression/dyspnea, and triage directly to nurses.'
  },
  {
    id: 'svc-nutrition',
    category: 'Nutrition & Social Determinants',
    title: 'Medically Tailored Home Meal Delivery',
    description: 'Nutritionally balanced, condition-specific frozen or chilled meals delivered weekly for diabetic, renal, or low-sodium senior diets.',
    target_cohort: 'Malnourished or mobility-impaired seniors living alone',
    delivery_channel: 'In-Person / Home',
    current_challenges: [
      'Packaging difficult for arthritic hands to open',
      'Lack of cultural/ethnic meal diversity',
      'Delivery volunteers often lack time for meaningful social check-ins'
    ],
    emerging_signals: [
      'Doorstep wellness audit checklists filled by delivery personnel',
      'Gut microbiome-tailored ready meals for elderly metabolic health',
      'Community dining hubs utilizing church and community kitchens'
    ],
    future_opportunity: 'Nutrition-as-medicine programs reimbursable under value-based care with companion volunteer social connection.'
  },
  {
    id: 'svc-mobility',
    category: 'Transportation & Independence',
    title: 'Assisted Paratransit & Medical Escort Rides',
    description: 'Door-through-door specialized van transit for seniors needing physical assistance to medical appointments, dialysis, and grocery shopping.',
    target_cohort: 'Non-driving seniors with mobility devices',
    delivery_channel: 'In-Person / Home',
    current_challenges: [
      'Requires 24-48 hour advance scheduling windows',
      'Long pickup wait windows causing patient anxiety',
      'Limited weekend or evening availability'
    ],
    emerging_signals: [
      'Autonomous accessible wheelchair-ready shuttle pilots',
      'On-demand rideshare subsidies with specially trained senior escorts',
      'Neighborhood volunteer driver coordination cooperatives'
    ],
    future_opportunity: 'Autonomous on-demand neighborhood shuttles with caregiver ride-sharing and integrated appointment check-in.'
  },
  {
    id: 'svc-isolation',
    category: 'Social Cohesion & Mental Wellness',
    title: 'Telephone Befriending & Community Companion Circles',
    description: 'Regular scheduled volunteer calls and social visits aimed at mitigating chronic loneliness, social isolation, and depression.',
    target_cohort: 'Widowed or isolated seniors living independently',
    delivery_channel: 'Digital / Hybrid',
    current_challenges: [
      'Volunteer attrition and inconsistent call schedules',
      'Difficulty matching shared interests and generational language',
      'Lack of clinical escalation when severe depressive signs emerge'
    ],
    emerging_signals: [
      'AI empathetic companionship companions for 24/7 conversation',
      'Virtual senior book clubs, gardening circles, and choir groups',
      'Senior micro-volunteering programs where seniors mentor youth'
    ],
    future_opportunity: 'Peer-to-peer senior skill exchanges where retirees provide virtual tutoring or mentoring, restoring purpose and reciprocal dignity.'
  }
];

export const HORIZON_SCAN_TRENDS = [
  {
    id: 'trend-1',
    theme: 'Ambient Assisted Living',
    weak_signal: 'Millimeter-wave radar sensors deployed in senior apartments detecting micro-movements, gait velocity, and bed-exit delays without video cameras.',
    drivers_of_change: 'Privacy concerns with optical cameras; surging fall rates among independent elderly; shrinking institutional nursing beds.',
    implications_for_seniors: 'Continuous passive safety net without feeling surveilled or having to remember to wear emergency alert pendants.',
    future_service_concept: 'Preventative Gait Intelligence Service: detects subtle 10-day gait slowing and triggers preventive physical therapy before a catastrophic hip fracture occurs.',
    horizon_timeline: 'Horizon 1 (1-2 yrs)'
  },
  {
    id: 'trend-2',
    theme: 'Autonomous Age-Tech & Caregiver Augmentation',
    weak_signal: 'Soft robotic exosuits and powered mobility belts entering clinical trials to assist home health aides with heavy patient transfers.',
    drivers_of_change: 'Catastrophic home care worker musculoskeletal injury rates; 30% projected eldercare labor shortage across OECD nations.',
    implications_for_seniors: 'Fewer dropped transfers, more dignified physical lifting, and prolonged tenure of trusted human caregivers.',
    future_service_concept: 'Bionic Caregiver Fleet: local agencies equipping aides with lightweight wearable lifters, doubling home visit capacity and eliminating caregiver injury.',
    horizon_timeline: 'Horizon 2 (3-5 yrs)'
  },
  {
    id: 'trend-3',
    theme: 'Intergenerational & Circular Living Models',
    weak_signal: 'Municipal co-housing developments offering free or subsidized rent to university students in exchange for 30 monthly hours of senior social companionship.',
    drivers_of_change: 'Student housing affordability crises coupled with extreme elder loneliness; demographic inversion in urban centers.',
    implications_for_seniors: 'Daily organic cross-generational dialogue, tech troubleshooting help, and reduction in cognitive decline symptoms.',
    future_service_concept: 'Civic Guilds for Aging: municipal platforms matching multi-generational housing pods with shared communal kitchens, skill shares, and emergency backup care.',
    horizon_timeline: 'Horizon 2 (3-5 yrs)'
  },
  {
    id: 'trend-4',
    theme: 'Longevity Therapeutics & Epigenetic Healthspan',
    weak_signal: 'Senolytic clinical trials, NAD+ precursors, and GLP-1 analogues reducing frailty biomarkers and systemic neuroinflammation in elderly cohorts.',
    drivers_of_change: 'Biomedical shift from treating isolated end-stage diseases to targeting the fundamental biology of aging (healthspan expansion).',
    implications_for_seniors: 'Seniors maintaining biological vitality and functional autonomy well into their late 80s and 90s.',
    future_service_concept: 'Personalized Healthspan Clinics: community wellness hubs offering periodic epigenetic age testing, tailored resistance training, and metabolic optimization for longevity.',
    horizon_timeline: 'Horizon 3 (5-10 yrs)'
  }
];
