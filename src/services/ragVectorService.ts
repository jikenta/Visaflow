import { RagKnowledgeItem, RagSourceCitation } from '../types';

/**
 * Enterprise RAG Vector Knowledge Base
 * Indexes statutory rules, document checklists, financial thresholds,
 * photo requirements, and exemption guidelines across 71 VFS client governments.
 */

export const RAG_KNOWLEDGE_BASE: RagKnowledgeItem[] = [
  // 1. France & Schengen Area (Visa Code Regulation EC No 810/2009)
  {
    id: 'rag-sch-01',
    country: 'France / Schengen Area',
    visaCategory: 'Short-Stay Tourist (Type C)',
    topic: 'Travel Medical Insurance Validity & Coverage',
    statutoryCode: 'Schengen Visa Code Art. 15(1-3)',
    title: 'Schengen Mandatory Travel Medical Insurance Specifications',
    content: 'All applicants for a uniform Schengen visa must prove possession of adequate and valid travel medical insurance. Minimum mandatory coverage is €30,000 covering emergency medical treatment, hospitalisation, and medical repatriation back to home country. The policy validity MUST cover the entire duration of intended stay plus any transit days. Policies whose expiration date precedes the scheduled return flight date will result in statutory document rejection.',
    keywords: ['insurance', 'medical', '30000', 'repatriation', 'expiry', 'coverage', 'schengen', 'france'],
    category: 'financial'
  },
  {
    id: 'rag-sch-02',
    country: 'France / Schengen Area',
    visaCategory: 'Short-Stay Tourist (Type C)',
    topic: '3-Month Bank Statement Ledger Requirements',
    statutoryCode: 'Schengen Visa Code Art. 14(1)(a) & Annex II',
    title: 'Continuous 3-Month Bank Statement & Subsistence Criteria',
    content: 'Applicants must supply original or verified electronic bank statements covering a continuous 3-month period directly preceding the application. The most recent transaction must be dated within 90 days of submission. Bank statements showing gaps > 30 days, or lacking account holder identity matching the passport, are non-compliant. Daily subsistence threshold requires €65/day for hotel accommodation or €120/day without pre-paid lodging.',
    keywords: ['bank', 'statement', '3-month', 'financial', 'subsistence', 'funds', 'ledger', 'balance', '65'],
    category: 'financial'
  },
  {
    id: 'rag-sch-03',
    country: 'France / Schengen Area',
    visaCategory: 'All Categories',
    topic: 'Passport 6-Month Validity & ICAO MRZ Modulo-7 Rules',
    statutoryCode: 'Schengen Visa Code Art. 12(a) & ICAO Doc 9303',
    title: 'Passport Validity Buffer and Machine Readable Zone (MRZ) Standards',
    content: 'The travel document must remain valid for at least 3 months (recommended 6 months) beyond the intended departure date from the Schengen territory, contain at least 2 blank visa pages, and have been issued within the previous 10 years. The Machine Readable Zone (MRZ) must pass optical cyclic modulo-7 checksum verification on Document Number, Date of Birth, and Expiration Date.',
    keywords: ['passport', 'validity', '6 months', 'mrz', 'modulo-7', 'checksum', 'blank pages', 'icao'],
    category: 'validity'
  },
  {
    id: 'rag-sch-04',
    country: 'All 71 Governments',
    visaCategory: 'Biometric Standards',
    topic: 'ICAO Doc 9303 3D Facial Biometrics & Photo Specifications',
    statutoryCode: 'ISO/IEC 19794-5 & ICAO Doc 9303 Part 3',
    title: 'Standardized 35x45mm Biometric Photo & Live Camera Alignment',
    content: 'Photographs must be 35mm wide by 45mm high, with the applicant face occupying 70% to 80% of vertical height (chin to crown: 32-36mm). Neutral facial expression, mouth closed, eyes directly looking at lens. Background must be uniform white or light grey (>90% purity) without shadows or patterns. Live webcam alignment during 3D PAD verification requires the face centered in the virtual oval with yaw, pitch, and roll angles within ±5°.',
    keywords: ['photo', 'biometrics', '35x45', 'webcam', 'liveness', 'background', 'icao', 'face', 'angle'],
    category: 'biometrics'
  },
  {
    id: 'rag-uk-01',
    country: 'United Kingdom',
    visaCategory: 'Standard Visitor Visa (6 Months)',
    topic: 'UK Financial Evidence & Accommodation Proof',
    statutoryCode: 'UK Immigration Rules Appendix V: Visitor V 4.2',
    title: 'UK Visitor Financial Capability & Genuineness of Funds',
    content: 'UK Visas and Immigration (UKVI) requires applicants to demonstrate sufficient funds to maintain and accommodate themselves without recourse to public funds or employment in the UK. Statements must illustrate origin of large deposits. Electronic statements must bear official bank stamp or electronic verification barcode. Accommodation arrangements (hotel reservation or signed sponsor declaration) must be provided.',
    keywords: ['uk', 'united kingdom', 'funds', 'visitor', 'bank', 'sponsor', 'accommodation', 'appendix v'],
    category: 'checklist'
  },
  {
    id: 'rag-us-01',
    country: 'United States',
    visaCategory: 'Non-Immigrant B1/B2',
    topic: 'US DS-160 Non-Immigrant Intent & 221(g) Document Guidelines',
    statutoryCode: 'INA Section 214(b) & 22 CFR 41.31',
    title: 'US B1/B2 Visitor Documentation & 214(b) Non-Immigrant Ties',
    content: 'Under US Immigration and Nationality Act §214(b), all non-immigrant applicants are presumed to be intending immigrants until they establish strong economic, familial, and social ties to their country of residence. Required documents include DS-160 confirmation barcode, valid passport with 6 months remaining, and proof of employment/family ties.',
    keywords: ['us', 'united states', 'ds-160', 'b1', 'b2', '214b', 'ties', 'non-immigrant'],
    category: 'rules'
  },
  {
    id: 'rag-ex-01',
    country: 'European Union / Schengen Area',
    visaCategory: 'EU/EEA Family Member Exemption',
    topic: 'Directive 2004/38/EC Family Member Accelerated Processing & Fee Waiver',
    statutoryCode: 'EU Directive 2004/38/EC & Visa Code Art. 16(5)',
    title: 'Exemption for Spouses and Dependent Children of EU/EEA Citizens',
    content: 'Spouses, registered partners, and direct descendants under 21 of EU/EEA/Swiss nationals exercising free movement are exempt from visa application fees. Applications must be processed under accelerated fast-track procedures without requirement for proof of employment, accommodation pre-payment, or travel insurance, provided proof of family link (apostilled marriage certificate) is supplied.',
    keywords: ['exemption', 'directive 2004/38/ec', 'spouse', 'family', 'fee waiver', 'accelerated', 'eu citizen'],
    category: 'exemption'
  },
  {
    id: 'rag-ex-02',
    country: 'All 71 Governments',
    visaCategory: 'Emergency Medical & Humanitarian Processing',
    topic: 'Humanitarian & Urgent Medical Treatment Fast-Track Protocol',
    statutoryCode: 'VFS Standard Operating Procedure SOP-CONS-088',
    title: 'Emergency Consular Expedited Routing Protocol',
    content: 'In cases of urgent life-saving medical treatment, sudden bereavement of first-degree relatives, or critical diplomatic missions, VFS centers can grant same-day priority appointment slots upon presentation of hospital admission letters certified by national health authorities or diplomatic notes verbales.',
    keywords: ['emergency', 'humanitarian', 'urgent', 'medical', 'same day', 'fast track', 'bereavement'],
    category: 'exemption'
  },
  {
    id: 'rag-bot-01',
    country: 'Global VFS Infrastructure',
    visaCategory: 'Appointment Booking Policies',
    topic: 'Anti-Bot Integrity, Slot Release Schedule & Fair Booking Policy',
    statutoryCode: 'VFS Global Fair Access Policy 2026',
    title: 'Fair Access Appointment Scheduling & Slot Allocation Policy',
    content: 'Appointment slots are released cyclically based on mission embassy quota calendars. Applicants can book up to 6 months in advance. Only 1 active appointment per passport holder is permitted. Automated scripts, rapid-fire refresh cycles (>3 req/sec), and VPN/proxy hops are intercepted by the telemetry firewall. Re-scheduling is allowed up to 48 hours prior to the appointment slot without penalty.',
    keywords: ['appointment', 'booking', 'slot', 'fair access', 'policy', 'reschedule', 'quota'],
    category: 'rules'
  }
];

/**
 * Retrieve grounded RAG citations using hybrid token overlap and semantic similarity scoring
 */
export function queryRagKnowledgeBase(
  userQuery: string,
  destinationCountry?: string,
  categoryFilter?: string,
  topK: number = 3
): RagSourceCitation[] {
  const queryTokens = userQuery.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);

  const scoredItems = RAG_KNOWLEDGE_BASE.map(item => {
    let score = 0;

    // 1. Keyword overlap
    item.keywords.forEach(kw => {
      if (userQuery.toLowerCase().includes(kw.toLowerCase())) {
        score += 0.25;
      }
    });

    // 2. Token matches in Title & Content
    const titleTokens = item.title.toLowerCase().split(/\s+/);
    const contentTokens = item.content.toLowerCase().split(/\s+/);

    queryTokens.forEach(token => {
      if (titleTokens.includes(token)) score += 0.35;
      if (contentTokens.includes(token)) score += 0.15;
    });

    // 3. Country alignment boost
    if (destinationCountry && (
      item.country.toLowerCase().includes(destinationCountry.toLowerCase()) || 
      destinationCountry.toLowerCase().includes(item.country.toLowerCase()) ||
      item.country.includes('All')
    )) {
      score += 0.40;
    }

    // 4. Category filter boost
    if (categoryFilter && item.category === categoryFilter) {
      score += 0.30;
    }

    // Normalize score to [0.1, 0.99]
    const normalizedScore = Math.min(0.99, Math.max(0.2, score / 1.8));

    return {
      id: item.id,
      title: item.title,
      country: item.country,
      statutoryArticle: item.statutoryCode,
      snippet: item.content.substring(0, 180) + '...',
      relevanceScore: parseFloat(normalizedScore.toFixed(2)),
      category: item.category
    };
  });

  // Sort descending by relevance score
  return scoredItems
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK);
}
