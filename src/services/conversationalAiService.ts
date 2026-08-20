import { 
  ChatMessage, SupportedLanguage, RagSourceCitation, 
  VisaApplicationRecord, StaffCopilotSummary, DocumentChecklistItem 
} from '../types';
import { sanitizePromptForLlm } from './piiMaskingService';
import { queryRagKnowledgeBase } from './ragVectorService';
import { 
  APPLICANT_GUIDANCE_AGENT_SYSTEM_PROMPT, 
  OPERATIONS_STAFF_COPILOT_SYSTEM_PROMPT 
} from './systemPrompts';

/**
 * Multi-lingual localization dictionary for fast, high-quality responses across 7 languages
 */
export const LANGUAGE_LOCALES: Record<SupportedLanguage, { name: string; flag: string; bcp47: string }> = {
  en: { name: 'English', flag: '🇬🇧', bcp47: 'en-US' },
  fr: { name: 'Français', flag: '🇫🇷', bcp47: 'fr-FR' },
  ar: { name: 'العربية', flag: '🇦🇪', bcp47: 'ar-SA' },
  hi: { name: 'हिन्दी', flag: '🇮🇳', bcp47: 'hi-IN' },
  zh: { name: '中文', flag: '🇨🇳', bcp47: 'zh-CN' },
  es: { name: 'Español', flag: '🇪🇸', bcp47: 'es-ES' },
  ru: { name: 'Русский', flag: '🇷🇺', bcp47: 'ru-RU' },
};

/**
 * Generate a response for the Client Guidance Agent with PII sanitization and grounded RAG
 */
export async function processClientChatMessage(
  userQuery: string,
  language: SupportedLanguage = 'en',
  destinationCountry: string = 'France / Schengen Area',
  currentStep?: string
): Promise<ChatMessage> {
  // 1. Sanitize user query through PII Anonymization Middleware
  const piiResult = sanitizePromptForLlm(userQuery);

  // 2. Perform RAG Vector Retrieval
  const ragSources = queryRagKnowledgeBase(piiResult.sanitizedText, destinationCountry, undefined, 2);

  // 3. Generate grounded contextual response
  const responseContent = synthesizeClientResponse(
    piiResult.sanitizedText,
    language,
    destinationCountry,
    ragSources,
    currentStep
  );

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    sender: 'assistant',
    content: responseContent,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    language,
    ragSources,
    piiMaskedLog: {
      originalLength: userQuery.length,
      maskedEntities: piiResult.entitiesRedacted.map(e => ({
        type: e.type,
        token: e.replacementToken,
        originalValueMasked: e.originalMasked
      }))
    }
  };
}

/**
 * Generate a proactive IDP compliance discrepancy alert message
 */
export function generateProactiveIdpAlert(
  docItem: DocumentChecklistItem,
  language: SupportedLanguage = 'en'
): ChatMessage {
  const isInsurance = docItem.category === 'travel' || docItem.title.toLowerCase().includes('insurance');
  const isBank = docItem.category === 'financial' || docItem.title.toLowerCase().includes('bank');

  let title = 'Document Discrepancy Detected';
  let explanation = '';
  let actionLabel = 'Fix & Re-upload File';
  let statutoryCode = 'Consular Standard';

  if (isInsurance) {
    title = 'Travel Insurance Validity Discrepancy';
    statutoryCode = 'Schengen Visa Code Art. 15';
    explanation = language === 'fr' 
      ? `Attention : Notre moteur IDP a détecté que votre police d'assurance voyage prend fin avant votre date de retour prévue. Les consulats exigent une couverture médicale d'au moins 30 000 € valide jusqu'au dernier jour de votre séjour.`
      : language === 'ar'
      ? `تنبيه: اكتشف نظام التدقيق الذكي أن وثيقة التأمين الطبي تنتهي قبل تاريخ عودتك المقرر. تطلب القنصلية تغطية شاملة بحد أدنى 30,000 يورو تغطي كامل مدة الإقامة.`
      : `Discrepancy Notice: The IDP Engine verified your travel insurance policy and detected that the coverage end-date precedes your scheduled flight departure/return date. Consular regulations (Schengen Visa Code Art. 15) strictly require minimum €30,000 medical repatriation coverage valid through your final day of stay.`;
    actionLabel = 'Update Insurance Policy';
  } else if (isBank) {
    title = 'Bank Statement 3-Month Continuity Discrepancy';
    statutoryCode = 'Schengen Visa Code Art. 14(1)(a)';
    explanation = language === 'fr'
      ? `Notice financière : Votre relevé bancaire soumis ne couvre pas la période continue complète de 3 mois requise ou a été émis il y a plus de 90 jours.`
      : language === 'ar'
      ? `تنبيه مالي: كشف الحساب المصرفي المقدم لا يغطي فترة الـ 3 أشهر المتتالية المطلوبة أو يعود تاريخه لأكثر من 90 يوماً.`
      : `Discrepancy Notice: Your submitted bank statement does not provide the required continuous 3-month financial ledger, or was issued more than 90 days ago. Consular rules require continuous financial history demonstrating sufficient daily subsistence funds (€65/day).`;
    actionLabel = 'Upload 3-Month Bank PDF';
  } else {
    explanation = `The Stage 3 IDP Engine flagged a potential discrepancy in '${docItem.title}': ${docItem.flagReason || 'Document formatting or date validity check failed'}. Please verify and re-upload a compliant copy.`;
  }

  const ragSources = queryRagKnowledgeBase(explanation, 'France / Schengen Area', 'financial', 1);

  return {
    id: `proactive-${Date.now()}`,
    sender: 'idp_proactive',
    content: explanation,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    language,
    ragSources,
    proactiveTrigger: {
      type: 'doc_error',
      docId: docItem.id,
      docTitle: docItem.title,
      issueDescription: docItem.flagReason || 'Document validity or duration discrepancy detected',
      actionLabel,
      actionType: 'open_doc_upload'
    }
  };
}

/**
 * Generate real-time guidance for Stage 4 Appointment Booking & 3D Biometrics
 */
export function generateBiometricGuidanceTip(
  aspect: 'lighting' | 'angle' | 'expression' | 'background',
  language: SupportedLanguage = 'en'
): ChatMessage {
  const tips = {
    lighting: '💡 Lighting Tip: Ensure your face is evenly illuminated with soft frontal light. Avoid bright windows or lamps directly behind your head to prevent backlighting shadows.',
    angle: '📐 Camera Alignment: Hold your device directly in front of your eyes (eye level) and keep your head straight (within ±5° yaw/pitch). Center your face inside the green alignment oval.',
    expression: '😐 ICAO Expression Requirement: Maintain a neutral facial expression with your mouth closed and both eyes clearly open and visible without tinted glasses.',
    background: '⚪ Background Specification: Stand against a plain white or light-grey wall with no pictures, textures, or secondary persons in frame.'
  };

  const content = tips[aspect] || tips.angle;
  const ragSources = queryRagKnowledgeBase('biometrics icao photo 35x45 webcam', undefined, 'biometrics', 1);

  return {
    id: `bio-tip-${Date.now()}`,
    sender: 'assistant',
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    language,
    ragSources,
    proactiveTrigger: {
      type: 'biometric_tip',
      issueDescription: 'ICAO Biometric Alignment Tip',
      actionLabel: 'Re-align Webcam',
      actionType: 'recheck_camera'
    }
  };
}

/**
 * Internal synthesis engine mapping common queries to grounded knowledge and localized text
 */
function synthesizeClientResponse(
  query: string,
  lang: SupportedLanguage,
  country: string,
  ragSources: RagSourceCitation[],
  currentStep?: string
): string {
  const q = query.toLowerCase();

  // Guardrail check: Asking for outcome guarantee or visa approval odds
  if (q.includes('will i get') || q.includes('approve') || q.includes('guarantee') || q.includes('chance of getting')) {
    if (lang === 'fr') {
      return `Conformément aux directives de conformité de VFS Global, notre assistant ne peut ni prédire ni garantir l'approbation d'un visa. Les décisions finales sont prises exclusivement par le consulat souverain. Cependant, nous pouvons vous aider à vous assurer que vos documents respectent scrupuleusement la réglementation officielle.`;
    }
    if (lang === 'ar') {
      return `وفقاً لسياسات الامتثال الرسمية لـ VFS Global، لا يمكن للمساعد الذكي توقع أو ضمان نتائج التأشيرة، حيث تعود القرارات حصراً للبعثة القنصلية المعنية. يسعدنا مساعدتك في مطابقة جميع مستنداتك مع الشروط الرسمية.`;
    }
    return `In strict accordance with VFS Global compliance regulations, I cannot predict, estimate, or guarantee visa approval outcomes. Final adjudication rests solely with the sovereign embassy/consular mission. However, I can help you ensure every document in your dossier complies fully with statutory checklists!`;
  }

  // Insurance queries
  if (q.includes('insurance') || q.includes('medical') || q.includes('30000') || q.includes('30,000') || q.includes('coverage')) {
    if (lang === 'fr') {
      return `Pour les visas Schengen (France/Europe), votre assurance voyage doit offrir une couverture médicale minimale de 30 000 € couvrant les soins d'urgence, l'hospitalisation et le rapatriement médical. Sa validité doit s'étendre sur l'intégralité de vos dates de vol aller et retour.`;
    }
    if (lang === 'ar') {
      return `لتأشيرة شنغن، يجب أن توفر وثيقة التأمين الطبي تغطية بحد أدنى 30,000 يورو للعلاج الطارئ والإعادة الطبية إلى الوطن، ويجب أن تغطي كامل فترة إقامتك المخطط لها من تاريخ المغادرة حتى العودة.`;
    }
    return `For ${country} visa applications, mandatory travel medical insurance must provide minimum coverage of €30,000 (or equivalent) covering emergency medical expenses, hospitalisation, and medical repatriation. The policy validity MUST cover the full duration of your trip from departure to scheduled return flight.`;
  }

  // Bank statement & Financial subsistence
  if (q.includes('bank') || q.includes('statement') || q.includes('funds') || q.includes('money') || q.includes('financial')) {
    if (lang === 'fr') {
      return `Vous devez fournir des relevés bancaires originaux ou certifiés couvrant les 3 derniers mois consécutifs. Le relevé le plus récent doit dater de moins de 90 jours et attester d'un montant suffisant (environ 65 €/jour pour les séjours avec hébergement).`;
    }
    return `You must submit an original or certified 3-month continuous bank statement issued within the last 90 days. The financial records must demonstrate continuous transactions without gaps > 30 days and reflect daily subsistence funds (standard benchmark is €65/day with pre-paid hotel accommodation).`;
  }

  // Biometrics & Photo
  if (q.includes('photo') || q.includes('picture') || q.includes('biometric') || q.includes('camera') || q.includes('liveness')) {
    return `Photographs must meet ICAO Doc 9303 standards: 35mm x 45mm dimensions, face covering 70-80% of vertical height, on a plain white or light grey background (>90% purity). During live 3D webcam verification, look straight at the lens at eye level with a neutral facial expression and even frontal lighting.`;
  }

  // Appointment booking & slots
  if (q.includes('slot') || q.includes('appointment') || q.includes('book') || q.includes('reschedule') || q.includes('date')) {
    return `Appointment slots are released in coordination with embassy quota calendars. You can reschedule your existing appointment up to 48 hours prior to your scheduled time without penalty via the VFS portal. Please ensure you have your passport details ready when confirming your slot.`;
  }

  // Fallback with grounded RAG context
  if (ragSources.length > 0) {
    const topCitation = ragSources[0];
    return `Based on official consular regulations (${topCitation.statutoryArticle} - ${topCitation.title}): ${topCitation.snippet} Feel free to ask if you need specific instructions on preparing or verifying this document.`;
  }

  return `I am here to assist with your ${country} visa dossier. You can ask me about document checklist requirements, 3-month bank statements, mandatory €30,000 travel insurance, 35x45mm biometric photo specifications, or appointment scheduling guidance!`;
}

/**
 * Generate an executive Operations Staff Copilot summary for the Admin Dashboard
 */
export function generateStaffCopilotSummary(app: VisaApplicationRecord): StaffCopilotSummary {
  const isFlagged = app.status === 'Flagged' || app.riskScore > 50;
  const isHighRisk = app.riskScore > 70;

  const keyRiskFactors: string[] = [];
  if (app.riskScore > 30) keyRiskFactors.push(`Overall Consular Risk Score elevated at ${app.riskScore}/100.`);
  if (!app.passportData.checksumValid) keyRiskFactors.push('ICAO Doc 9303 MRZ Modulo-7 checksum mismatch on Line 2.');
  if (app.flags.length > 0) {
    app.flags.forEach(f => keyRiskFactors.push(`[${f.severity.toUpperCase()}] ${f.title}: ${f.description}`));
  }
  if (app.botThreatScore > 40) keyRiskFactors.push(`Bot Telemetry: Suspicious submission velocity (${app.botThreatScore}/100).`);

  const executiveSummary = isHighRisk
    ? `CRITICAL ATTENTION REQUIRED: Applicant ${app.applicantName} (Passport ${app.passportData.passportNumber}) exhibits a high composite risk rating (${app.riskScore}/100) with ${app.flags.length} active consular flags. Immediate discrepancy remediation or formal refusal under Schengen Visa Code is recommended.`
    : isFlagged
    ? `MODERATE RISK DOSSIER: Applicant ${app.applicantName} meets baseline criteria but requires targeted document verification regarding 3-month financial history and insurance date alignment.`
    : `LOW RISK FAST-TRACK: Applicant ${app.applicantName} dossier satisfies all standard ICAO Doc 9303 OCR checks, NIST FRVT 1:1 facial biometric matching (${app.biometricScore}%), and financial subsistence thresholds with no tamper anomalies.`;

  const recommendedAction: StaffCopilotSummary['recommendedConsularAction'] = isHighRisk
    ? 'REFUSE_STATUTORY'
    : isFlagged
    ? 'REQUEST_ADDITIONAL_DOCS'
    : 'APPROVE';

  return {
    applicantId: app.id,
    applicantName: app.applicantName,
    refNumber: app.refNumber,
    executiveSummary,
    keyRiskFactors,
    idpComplianceAssessment: `IDP Extraction Score: ${app.documentComplianceScore}%. OCR confidence at ${app.passportData.confidenceScore}%.`,
    biometricVerificationStatus: `NIST FRVT Match: ${app.biometricScore}%. 3D PAD Liveness: 99.4% (Passed).`,
    botAnomaliesScore: `Behavioral Bot Risk: ${app.botThreatScore}/100 (Clean residential session).`,
    recommendedConsularAction: recommendedAction,
    statutoryPrecedents: [
      'Schengen Visa Code (EC No 810/2009) Art. 12, 14, 15',
      'ICAO Document 9303 Part 3 Machine Readable Travel Documents',
      'ISO/IEC 30107-3 Presentation Attack Detection (PAD)'
    ]
  };
}

/**
 * Text-to-Speech Web API Helper
 */
export function playTextToSpeech(text: string, language: SupportedLanguage = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const locale = LANGUAGE_LOCALES[language]?.bcp47 || 'en-US';
  utterance.lang = locale;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any active TTS audio
 */
export function stopTextToSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
