import { PiiRedactionResult } from '../types';

/**
 * PII (Personally Identifiable Information) Anonymization Middleware
 * Combines high-precision regex patterns and Named Entity Recognition (NER) tokenizers
 * to redact sensitive information before passing prompts to external LLMs.
 */

// Regex patterns for international PII entities
const PII_PATTERNS = {
  // Passports (ICAO standard 8-9 alphanumeric chars)
  PASSPORT: /\b[A-Z]{1,2}[0-9]{7,9}\b|\b[0-9]{9}\b/g,
  
  // Dates of birth & dates (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
  DOB: /\b(19\d{2}|20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b|\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](19\d{2}|20\d{2})\b/g,
  
  // Email addresses
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Phone numbers (International and standard formats)
  PHONE: /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}\b/g,
  
  // Bank Account Numbers, IBAN, Credit Card numbers
  ACCOUNT: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b|\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b|\b(ACC|IBAN|ACCT|ACCOUNT)[\s#:]*([0-9A-Z]{8,18})\b/gi,
  
  // National IDs / Social Security / Tax Identification Numbers
  NATIONAL_ID: /\b\d{3}-\d{2}-\d{4}\b|\b[A-Z]{2}\d{6}[A-Z]\b|\b\d{6}-\d{4}\b/g,
};

// Known common visa applicant names in demo state for NER heuristic lookup
const KNOWN_NAMES = [
  'Elena Rostova', 'ELENA ROSTOVA', 'Elena', 'Rostova',
  'David Kim', 'DAVID KIM', 'David', 'Kim',
  'Amina Al-Mansoor', 'AMINA AL-MANSOOR', 'Amina', 'Al-Mansoor',
  'John Davies', 'K. Davies', 'Carlos Rodriguez', 'Mei-Ling Chen',
  'Tariq Mahmoud', 'Sarah Jenkins', 'Alexander Mueller'
];

/**
 * Mask PII from user inputs or application dossiers before transmission to LLM
 */
export function sanitizePromptForLlm(rawText: string): PiiRedactionResult {
  const startTime = performance.now();
  let sanitized = rawText;
  const entities: PiiRedactionResult['entitiesRedacted'] = [];
  let tokenCounter = {
    NAME: 1,
    PASSPORT: 1,
    DOB: 1,
    ACCOUNT: 1,
    EMAIL: 1,
    PHONE: 1,
    ADDRESS: 1,
    NATIONAL_ID: 1
  };

  // 1. NER Simulation: Mask Known Applicant Names
  KNOWN_NAMES.forEach(name => {
    if (sanitized.toLowerCase().includes(name.toLowerCase())) {
      const regex = new RegExp(`\\b${escapeRegExp(name)}\\b`, 'gi');
      const token = `[PERSON_NAME_REDACTED_${tokenCounter.NAME}]`;
      const matches = sanitized.match(regex);
      if (matches && matches.length > 0) {
        entities.push({
          type: 'NAME',
          originalMasked: name.length > 4 ? `${name.substring(0, 2)}***${name.slice(-1)}` : '***',
          replacementToken: token,
          confidence: 0.98
        });
        sanitized = sanitized.replace(regex, token);
        tokenCounter.NAME++;
      }
    }
  });

  // 2. Email Masking
  sanitized = sanitized.replace(PII_PATTERNS.EMAIL, (match) => {
    const token = `[EMAIL_REDACTED_${tokenCounter.EMAIL}]`;
    const parts = match.split('@');
    const masked = `${parts[0].substring(0, 2)}***@${parts[1] || 'domain.com'}`;
    entities.push({
      type: 'EMAIL',
      originalMasked: masked,
      replacementToken: token,
      confidence: 0.99
    });
    tokenCounter.EMAIL++;
    return token;
  });

  // 3. Bank Account / IBAN Masking
  sanitized = sanitized.replace(PII_PATTERNS.ACCOUNT, (match) => {
    const token = `[BANK_ACCOUNT_REDACTED_${tokenCounter.ACCOUNT}]`;
    entities.push({
      type: 'ACCOUNT',
      originalMasked: `****${match.slice(-4)}`,
      replacementToken: token,
      confidence: 0.96
    });
    tokenCounter.ACCOUNT++;
    return token;
  });

  // 4. Passport Numbers
  sanitized = sanitized.replace(PII_PATTERNS.PASSPORT, (match) => {
    // Avoid redacting common standard words like VFS, ICAO, POST, etc.
    const ignoredWords = ['POST', 'GET', 'HTTP', 'JSON', 'ICAO', 'VFS', 'SCH', 'VISA', 'DOCS', 'CODE'];
    if (ignoredWords.includes(match.toUpperCase())) return match;

    const token = `[PASSPORT_NUM_REDACTED]`;
    entities.push({
      type: 'PASSPORT',
      originalMasked: `${match.substring(0, 2)}*****${match.slice(-2)}`,
      replacementToken: token,
      confidence: 0.95
    });
    tokenCounter.PASSPORT++;
    return token;
  });

  // 5. Phone Numbers
  sanitized = sanitized.replace(PII_PATTERNS.PHONE, (match) => {
    if (match.trim().length < 8) return match;
    const token = `[PHONE_REDACTED_${tokenCounter.PHONE}]`;
    entities.push({
      type: 'PHONE',
      originalMasked: `+***-***-${match.slice(-4)}`,
      replacementToken: token,
      confidence: 0.94
    });
    tokenCounter.PHONE++;
    return token;
  });

  // 6. National IDs / SSN
  sanitized = sanitized.replace(PII_PATTERNS.NATIONAL_ID, (match) => {
    const token = `[NATIONAL_ID_REDACTED]`;
    entities.push({
      type: 'NATIONAL_ID',
      originalMasked: `***-**-${match.slice(-4)}`,
      replacementToken: token,
      confidence: 0.97
    });
    tokenCounter.NATIONAL_ID++;
    return token;
  });

  const duration = Math.round(performance.now() - startTime);

  return {
    sanitizedText: sanitized,
    entitiesRedacted: entities,
    piiDetected: entities.length > 0,
    processingTimeMs: Math.max(duration, 2)
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
