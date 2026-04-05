export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type DetectionType = 'regex' | 'dictionary';

export interface ClassifierDef {
  id: string;
  name: string;
  category: string;
  severity: Severity;
  type: DetectionType;
  pattern: string;
  flags: string;
  dictionary: string[];
  tag: string;
  builtin: boolean;
}

export const TAG_OPTIONS = [
  { value: 'tag-red', label: 'Red' },
  { value: 'tag-orange', label: 'Orange' },
  { value: 'tag-blue', label: 'Blue' },
  { value: 'tag-green', label: 'Green' },
  { value: 'tag-purple', label: 'Purple' },
];

export const SEVERITY_OPTIONS: Severity[] = ['Low', 'Medium', 'High', 'Critical'];

export const CATEGORY_PRESETS = ['PII', 'PCI', 'PHI', 'Financial', 'Network', 'Credentials', 'Custom'];

export const sevOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };
export const sevColor: Record<string, string> = { Low: '#66bb6a', Medium: '#ffa726', High: '#ef5350', Critical: '#f44336' };

export const builtinClassifiers: ClassifierDef[] = [
  { id: 'bi_ssn', name: 'Social Security Number (SSN)', category: 'PII', severity: 'Critical', type: 'regex', pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b', flags: 'g', dictionary: [], tag: 'tag-red', builtin: true },
  { id: 'bi_visa', name: 'Credit Card - Visa', category: 'PCI', severity: 'Critical', type: 'regex', pattern: '\\b4\\d{3}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b', flags: 'g', dictionary: [], tag: 'tag-orange', builtin: true },
  { id: 'bi_mc', name: 'Credit Card - Mastercard', category: 'PCI', severity: 'Critical', type: 'regex', pattern: '\\b5[1-5]\\d{2}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b', flags: 'g', dictionary: [], tag: 'tag-orange', builtin: true },
  { id: 'bi_amex', name: 'Credit Card - Amex', category: 'PCI', severity: 'Critical', type: 'regex', pattern: '\\b3[47]\\d{2}[- ]?\\d{6}[- ]?\\d{5}\\b', flags: 'g', dictionary: [], tag: 'tag-orange', builtin: true },
  { id: 'bi_discover', name: 'Credit Card - Discover', category: 'PCI', severity: 'Critical', type: 'regex', pattern: '\\b6011[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b', flags: 'g', dictionary: [], tag: 'tag-orange', builtin: true },
  { id: 'bi_email', name: 'Email Address', category: 'PII', severity: 'Medium', type: 'regex', pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b', flags: 'g', dictionary: [], tag: 'tag-blue', builtin: true },
  { id: 'bi_phone', name: 'Phone Number', category: 'PII', severity: 'Medium', type: 'regex', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', flags: 'g', dictionary: [], tag: 'tag-blue', builtin: true },
  { id: 'bi_dob', name: 'Date of Birth', category: 'PII', severity: 'High', type: 'regex', pattern: '\\b(?:0[1-9]|1[0-2])[/-](?:0[1-9]|[12]\\d|3[01])[/-](?:19|20)\\d{2}\\b', flags: 'g', dictionary: [], tag: 'tag-blue', builtin: true },
  { id: 'bi_ipv4', name: 'IPv4 Address', category: 'Network', severity: 'Low', type: 'regex', pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b', flags: 'g', dictionary: [], tag: 'tag-green', builtin: true },
  { id: 'bi_mrn', name: 'Medical Record Number', category: 'PHI', severity: 'Critical', type: 'regex', pattern: '\\bMRN[- ]?\\d{4}[- ]?\\d{4,6}\\b', flags: 'gi', dictionary: [], tag: 'tag-red', builtin: true },
  { id: 'bi_icd10', name: 'ICD-10 Code', category: 'PHI', severity: 'High', type: 'regex', pattern: '\\b[A-Z]\\d{2}\\.?\\d{1,2}\\b', flags: 'g', dictionary: [], tag: 'tag-red', builtin: true },
  { id: 'bi_hpid', name: 'Health Plan ID', category: 'PHI', severity: 'High', type: 'regex', pattern: '\\bHP[- ]\\d{6}[- ]?[A-Z]\\b', flags: 'g', dictionary: [], tag: 'tag-red', builtin: true },
  { id: 'bi_routing', name: 'Bank Routing Number', category: 'Financial', severity: 'High', type: 'regex', pattern: '\\b\\d{9}\\b', flags: 'g', dictionary: [], tag: 'tag-green', builtin: true },
  { id: 'bi_swift', name: 'SWIFT/BIC Code', category: 'Financial', severity: 'High', type: 'regex', pattern: '\\b[A-Z]{4}US[A-Z0-9]{2}\\b', flags: 'g', dictionary: [], tag: 'tag-green', builtin: true },
  { id: 'bi_iban', name: 'IBAN', category: 'Financial', severity: 'High', type: 'regex', pattern: '\\b[A-Z]{2}\\d{2}[A-Z0-9]{10,30}\\b', flags: 'g', dictionary: [], tag: 'tag-green', builtin: true },
  { id: 'bi_ein', name: 'EIN / Tax ID', category: 'Financial', severity: 'High', type: 'regex', pattern: '\\b\\d{2}-\\d{7}\\b', flags: 'g', dictionary: [], tag: 'tag-green', builtin: true },
  { id: 'bi_aws', name: 'AWS Access Key', category: 'Credentials', severity: 'Critical', type: 'regex', pattern: '\\bAKIA[0-9A-Z]{16}\\b', flags: 'g', dictionary: [], tag: 'tag-purple', builtin: true },
  { id: 'bi_apitoken', name: 'API Token', category: 'Credentials', severity: 'Critical', type: 'regex', pattern: '\\b(?:tok_|sk_|pk_|api_)[A-Za-z0-9]{16,}\\b', flags: 'g', dictionary: [], tag: 'tag-purple', builtin: true },
  { id: 'bi_cvv', name: 'CVV Code', category: 'PCI', severity: 'Critical', type: 'regex', pattern: '\\bCVV:?\\s*\\d{3,4}\\b', flags: 'gi', dictionary: [], tag: 'tag-orange', builtin: true },
  { id: 'bi_npi', name: 'NPI Number', category: 'PHI', severity: 'High', type: 'regex', pattern: '\\bNPI:?\\s*\\d{10}\\b', flags: 'gi', dictionary: [], tag: 'tag-red', builtin: true },
];

const STORAGE_KEY = 'fortrafied_custom_classifiers';

export function loadCustomClassifiers(): ClassifierDef[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ClassifierDef[];
  } catch {
    return [];
  }
}

export function saveCustomClassifiers(defs: ClassifierDef[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defs));
}

export function buildRegex(def: ClassifierDef): RegExp {
  if (def.type === 'dictionary' && def.dictionary.length > 0) {
    const escaped = def.dictionary.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = '\\b(?:' + escaped.join('|') + ')\\b';
    return new RegExp(pattern, def.flags);
  }
  return new RegExp(def.pattern, def.flags);
}

export function getAllClassifiers(): ClassifierDef[] {
  return [...builtinClassifiers, ...loadCustomClassifiers()];
}
