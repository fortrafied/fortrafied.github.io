import JSZip from 'jszip';

// ── Types ──────────────────────────────────────────────────────────────────

export interface DocumentProperty {
  name: string;
  value: string;
  source: string; // e.g. "core", "app", "custom", "pdf-info", "classification"
}

export interface ParsedFile {
  text: string;
  properties: DocumentProperty[];
  classificationLabels: DocumentProperty[];
  fileType: string;
}

// ── Known classification property prefixes/keys ────────────────────────────

const CLASSIFICATION_KEYS: { pattern: RegExp; product: string }[] = [
  // Microsoft Purview / MIP / AIP
  { pattern: /^MSIP_Label/i, product: 'Microsoft Purview / MIP' },
  { pattern: /^msip_label/i, product: 'Microsoft Purview / MIP' },
  { pattern: /^SensitivityLabel/i, product: 'Microsoft Purview' },
  { pattern: /^ContentType.*sensitive/i, product: 'Microsoft Purview' },
  // Titus (now HelpSystems / Fortra)
  { pattern: /^Titus/i, product: 'Titus Classification' },
  { pattern: /^TitusGUID/i, product: 'Titus Classification' },
  // Boldon James
  { pattern: /^BoldonJames/i, product: 'Boldon James Classifier' },
  { pattern: /^bjClassification/i, product: 'Boldon James Classifier' },
  { pattern: /^BJSFC/i, product: 'Boldon James Classifier' },
  // Fortra Digital Guardian
  { pattern: /^DG[_-]/i, product: 'Fortra Digital Guardian' },
  { pattern: /^DigitalGuardian/i, product: 'Fortra Digital Guardian' },
  // Workshare / Litera
  { pattern: /^Workshare/i, product: 'Workshare' },
  // Janusseal
  { pattern: /^Janusseal/i, product: 'Janusseal' },
  // CLASSIFIER
  { pattern: /^Classifier/i, product: 'Generic Classifier' },
  // Seclore
  { pattern: /^Seclore/i, product: 'Seclore' },
  // Vera
  { pattern: /^Vera/i, product: 'Vera' },
  // Generic classification keywords
  { pattern: /^Classification$/i, product: 'Generic' },
  { pattern: /^SecurityClassification/i, product: 'Generic' },
  { pattern: /^Sensitivity$/i, product: 'Generic' },
  { pattern: /^SensitivityLevel/i, product: 'Generic' },
  { pattern: /^ProtectionLevel/i, product: 'Generic' },
  { pattern: /^DataClassification/i, product: 'Generic' },
  { pattern: /^InformationClassification/i, product: 'Generic' },
  { pattern: /^Confidentiality/i, product: 'Generic' },
  { pattern: /^HandlingMarking/i, product: 'Generic' },
];

function identifyClassificationLabel(name: string): string | null {
  for (const entry of CLASSIFICATION_KEYS) {
    if (entry.pattern.test(name)) return entry.product;
  }
  return null;
}

// ── XML helpers ────────────────────────────────────────────────────────────

function parseXml(xmlString: string): Document {
  return new DOMParser().parseFromString(xmlString, 'text/xml');
}

function getTextContent(el: Element | null): string {
  return el?.textContent?.trim() ?? '';
}

// ── Office (OOXML) parsing ─────────────────────────────────────────────────

async function parseOfficeFile(buffer: ArrayBuffer, ext: string): Promise<ParsedFile> {
  const zip = await JSZip.loadAsync(buffer);
  const properties: DocumentProperty[] = [];
  const classificationLabels: DocumentProperty[] = [];

  // Core properties (docProps/core.xml) — Dublin Core + CP
  const coreXml = zip.file('docProps/core.xml');
  if (coreXml) {
    const doc = parseXml(await coreXml.async('string'));
    const fields = [
      'dc:title', 'dc:subject', 'dc:creator', 'dc:description',
      'cp:keywords', 'cp:category', 'cp:lastModifiedBy',
      'dcterms:created', 'dcterms:modified', 'cp:revision',
      'cp:contentStatus', 'dc:language',
    ];
    for (const field of fields) {
      const [ns, local] = field.split(':');
      // Try both namespaced and local name lookups
      const els = doc.getElementsByTagName(field);
      const el = els.length > 0 ? els[0] : doc.getElementsByTagNameNS('*', local)[0];
      const val = getTextContent(el);
      if (val) {
        const label = local.charAt(0).toUpperCase() + local.slice(1);
        properties.push({ name: label, value: val, source: 'core' });
      }
    }
  }

  // App properties (docProps/app.xml)
  const appXml = zip.file('docProps/app.xml');
  if (appXml) {
    const doc = parseXml(await appXml.async('string'));
    const fields = [
      'Application', 'AppVersion', 'Company', 'Manager', 'Template',
      'TotalTime', 'Pages', 'Words', 'Characters', 'Slides', 'Paragraphs',
      'Lines', 'PresentationFormat', 'SharedDoc', 'HyperlinkBase',
    ];
    for (const field of fields) {
      const els = doc.getElementsByTagName(field);
      const val = getTextContent(els[0]);
      if (val) {
        properties.push({ name: field, value: val, source: 'app' });
      }
    }
  }

  // Custom properties (docProps/custom.xml) — WHERE CLASSIFICATION LIVES
  const customXml = zip.file('docProps/custom.xml');
  if (customXml) {
    const doc = parseXml(await customXml.async('string'));
    const props = doc.getElementsByTagName('property');
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const name = prop.getAttribute('name') ?? prop.getAttribute('fmtid') ?? `Property_${i}`;
      // Value can be in different typed child elements
      let value = '';
      for (let j = 0; j < prop.children.length; j++) {
        const child = prop.children[j];
        if (child.textContent) { value = child.textContent.trim(); break; }
      }
      if (!value) value = getTextContent(prop);

      const product = identifyClassificationLabel(name);
      const entry: DocumentProperty = { name, value, source: product ? 'classification' : 'custom' };
      properties.push(entry);
      if (product) {
        classificationLabels.push({ name, value, source: product });
      }
    }
  }

  // Content-type based properties from [Content_Types].xml
  const contentTypes = zip.file('[Content_Types].xml');
  if (contentTypes) {
    const doc = parseXml(await contentTypes.async('string'));
    // Check for custom XML parts (some classifiers embed data here)
    const overrides = doc.getElementsByTagName('Override');
    for (let i = 0; i < overrides.length; i++) {
      const partName = overrides[i].getAttribute('PartName') ?? '';
      if (partName.includes('customXml') || partName.includes('labelInfo')) {
        properties.push({ name: 'Custom XML Part', value: partName, source: 'content-types' });
      }
    }
  }

  // Check for custom XML data parts (used by MIP and others)
  const customXmlFiles = Object.keys(zip.files).filter(
    (f) => f.startsWith('customXml/') && f.endsWith('.xml') && !f.endsWith('Properties.xml')
  );
  for (const path of customXmlFiles) {
    const file = zip.file(path);
    if (file) {
      const content = await file.async('string');
      // Look for classification-related content
      if (/label|classif|sensiti|protect|marking/i.test(content)) {
        const doc = parseXml(content);
        const root = doc.documentElement;
        if (root) {
          properties.push({ name: `Custom XML (${path})`, value: root.tagName, source: 'custom-xml' });
          // Try to extract label values from the XML
          const allEls = root.getElementsByTagName('*');
          for (let i = 0; i < allEls.length; i++) {
            const el = allEls[i];
            const attrs = el.attributes;
            for (let a = 0; a < attrs.length; a++) {
              const attr = attrs[a];
              const product = identifyClassificationLabel(attr.name);
              if (product) {
                classificationLabels.push({ name: attr.name, value: attr.value, source: product });
              }
            }
            if (el.childElementCount === 0 && el.textContent?.trim()) {
              const product = identifyClassificationLabel(el.localName);
              if (product) {
                classificationLabels.push({ name: el.localName, value: el.textContent.trim(), source: product });
              }
            }
          }
        }
      }
    }
  }

  // Extract text content
  let text = '';
  if (ext === 'docx') {
    text = await extractDocxText(zip);
  } else if (ext === 'xlsx') {
    text = await extractXlsxText(zip);
  } else if (ext === 'pptx') {
    text = await extractPptxText(zip);
  }

  return { text, properties, classificationLabels, fileType: ext.toUpperCase() };
}

async function extractDocxText(zip: JSZip): Promise<string> {
  const docXml = zip.file('word/document.xml');
  if (!docXml) return '';
  const doc = parseXml(await docXml.async('string'));
  const paragraphs: string[] = [];
  const pEls = doc.getElementsByTagName('w:p');
  for (let i = 0; i < pEls.length; i++) {
    const runs = pEls[i].getElementsByTagName('w:t');
    let line = '';
    for (let j = 0; j < runs.length; j++) {
      line += runs[j].textContent ?? '';
    }
    if (line) paragraphs.push(line);
  }
  // Also try headers/footers
  for (const path of Object.keys(zip.files)) {
    if (/word\/(header|footer)\d+\.xml/.test(path)) {
      const file = zip.file(path);
      if (file) {
        const hDoc = parseXml(await file.async('string'));
        const hParagraphs = hDoc.getElementsByTagName('w:t');
        for (let i = 0; i < hParagraphs.length; i++) {
          const t = hParagraphs[i].textContent?.trim();
          if (t) paragraphs.push(t);
        }
      }
    }
  }
  return paragraphs.join('\n');
}

async function extractXlsxText(zip: JSZip): Promise<string> {
  // Read shared strings
  const sharedStrings: string[] = [];
  const ssFile = zip.file('xl/sharedStrings.xml');
  if (ssFile) {
    const doc = parseXml(await ssFile.async('string'));
    const sis = doc.getElementsByTagName('si');
    for (let i = 0; i < sis.length; i++) {
      const tEls = sis[i].getElementsByTagName('t');
      let val = '';
      for (let j = 0; j < tEls.length; j++) val += tEls[j].textContent ?? '';
      sharedStrings.push(val);
    }
  }
  // Read sheet data
  const lines: string[] = [];
  const sheetFiles = Object.keys(zip.files)
    .filter((f) => /xl\/worksheets\/sheet\d+\.xml/.test(f))
    .sort();
  for (const path of sheetFiles) {
    const file = zip.file(path);
    if (!file) continue;
    const doc = parseXml(await file.async('string'));
    const rows = doc.getElementsByTagName('row');
    for (let r = 0; r < rows.length; r++) {
      const cells = rows[r].getElementsByTagName('c');
      const values: string[] = [];
      for (let c = 0; c < cells.length; c++) {
        const cell = cells[c];
        const type = cell.getAttribute('t');
        const vEl = cell.getElementsByTagName('v')[0];
        const raw = vEl?.textContent ?? '';
        if (type === 's' && sharedStrings[parseInt(raw)]) {
          values.push(sharedStrings[parseInt(raw)]);
        } else {
          values.push(raw);
        }
      }
      if (values.some((v) => v)) lines.push(values.join('\t'));
    }
  }
  return lines.join('\n');
}

async function extractPptxText(zip: JSZip): Promise<string> {
  const paragraphs: string[] = [];
  const slideFiles = Object.keys(zip.files)
    .filter((f) => /ppt\/slides\/slide\d+\.xml/.test(f))
    .sort();
  for (const path of slideFiles) {
    const file = zip.file(path);
    if (!file) continue;
    const doc = parseXml(await file.async('string'));
    const tEls = doc.getElementsByTagName('a:t');
    for (let i = 0; i < tEls.length; i++) {
      const t = tEls[i].textContent?.trim();
      if (t) paragraphs.push(t);
    }
  }
  // Also check slide notes
  const noteFiles = Object.keys(zip.files)
    .filter((f) => /ppt\/notesSlides\/notesSlide\d+\.xml/.test(f));
  for (const path of noteFiles) {
    const file = zip.file(path);
    if (file) {
      const doc = parseXml(await file.async('string'));
      const tEls = doc.getElementsByTagName('a:t');
      for (let i = 0; i < tEls.length; i++) {
        const t = tEls[i].textContent?.trim();
        if (t) paragraphs.push(t);
      }
    }
  }
  return paragraphs.join('\n');
}

// ── PDF parsing ────────────────────────────────────────────────────────────

async function parsePdfFile(buffer: ArrayBuffer): Promise<ParsedFile> {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist');

  // Use fake worker to avoid web worker setup complexity in static builds
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
    disableAutoFetch: true,
  });
  const pdf = await loadingTask.promise;

  const properties: DocumentProperty[] = [];
  const classificationLabels: DocumentProperty[] = [];

  // Extract metadata
  const metadata = await pdf.getMetadata();

  if (metadata.info) {
    const info = metadata.info as Record<string, unknown>;
    const fields = [
      'Title', 'Author', 'Subject', 'Keywords', 'Creator', 'Producer',
      'CreationDate', 'ModDate', 'Trapped', 'PDFFormatVersion',
    ];
    for (const field of fields) {
      const val = info[field];
      if (val !== undefined && val !== null && String(val).trim()) {
        properties.push({ name: field, value: String(val), source: 'pdf-info' });
      }
    }
    // Check for custom/non-standard properties (where classification might live)
    for (const [key, val] of Object.entries(info)) {
      if (!fields.includes(key) && val && String(val).trim()) {
        const product = identifyClassificationLabel(key);
        const entry: DocumentProperty = {
          name: key,
          value: String(val),
          source: product ? 'classification' : 'pdf-custom',
        };
        properties.push(entry);
        if (product) {
          classificationLabels.push({ name: key, value: String(val), source: product });
        }
      }
    }
  }

  // XMP metadata (often contains classification in PDF)
  if (metadata.metadata) {
    const xmpMeta = metadata.metadata as unknown as { getAll?: () => Record<string, string> } | null;
    if (xmpMeta && typeof xmpMeta.getAll === 'function') {
      const all = xmpMeta.getAll();
      for (const [key, val] of Object.entries(all)) {
        if (val && String(val).trim()) {
          const product = identifyClassificationLabel(key);
          const entry: DocumentProperty = {
            name: key,
            value: String(val),
            source: product ? 'classification' : 'xmp',
          };
          properties.push(entry);
          if (product) {
            classificationLabels.push({ name: key, value: String(val), source: product });
          }
        }
      }
    }
  }

  // Extract text
  const textParts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    if (pageText.trim()) textParts.push(pageText);
  }

  properties.push({ name: 'Pages', value: String(pdf.numPages), source: 'pdf-info' });

  return {
    text: textParts.join('\n'),
    properties,
    classificationLabels,
    fileType: 'PDF',
  };
}

// ── TXT parsing ────────────────────────────────────────────────────────────

async function parseTxtFile(buffer: ArrayBuffer, file: File): Promise<ParsedFile> {
  const text = new TextDecoder().decode(buffer);
  return {
    text,
    properties: [
      { name: 'File Name', value: file.name, source: 'file' },
      { name: 'Size', value: formatBytes(file.size), source: 'file' },
      { name: 'MIME Type', value: file.type || 'text/plain', source: 'file' },
      { name: 'Last Modified', value: new Date(file.lastModified).toLocaleString(), source: 'file' },
    ],
    classificationLabels: [],
    fileType: 'TXT',
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ── HTML / Vera encrypted file parsing ────────────────────────────────────

interface VeraDocsPayload {
  version?: number;
  docId?: string;
  docName?: string;
  mimeType?: string;
  serverUrl?: string;
  tenant?: string;
  [key: string]: unknown;
}

async function parseHtmlFile(buffer: ArrayBuffer, file: File): Promise<ParsedFile> {
  const html = new TextDecoder().decode(buffer);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const properties: DocumentProperty[] = [];
  const classificationLabels: DocumentProperty[] = [];

  // Detect Vera encrypted file via <meta name="veradocs">
  const veraDocsMeta = doc.querySelector('meta[name="veradocs"]');
  const isVera = !!veraDocsMeta;

  if (isVera && veraDocsMeta) {
    const rawJson = veraDocsMeta.getAttribute('content') ?? '';
    let veraData: VeraDocsPayload = {};
    try {
      veraData = JSON.parse(rawJson) as VeraDocsPayload;
    } catch {
      // Store raw if unparseable
      properties.push({ name: 'veradocs (raw)', value: rawJson, source: 'vera' });
    }

    // Present each field from the veradocs JSON
    if (veraData.version !== undefined) {
      properties.push({ name: 'Vera Format Version', value: String(veraData.version), source: 'vera' });
    }
    if (veraData.docId) {
      properties.push({ name: 'Document ID', value: veraData.docId, source: 'vera' });
    }
    if (veraData.docName) {
      properties.push({ name: 'Original File Name', value: veraData.docName, source: 'vera' });
    }
    if (veraData.mimeType) {
      properties.push({ name: 'Original MIME Type', value: veraData.mimeType, source: 'vera' });
    }
    if (veraData.serverUrl) {
      properties.push({ name: 'Vera Server URL', value: veraData.serverUrl, source: 'vera' });
    }
    if (veraData.tenant) {
      properties.push({ name: 'Vera Tenant', value: veraData.tenant, source: 'vera' });
    }
    // Capture any additional/unexpected fields
    const knownKeys = new Set(['version', 'docId', 'docName', 'mimeType', 'serverUrl', 'tenant']);
    for (const [key, val] of Object.entries(veraData)) {
      if (!knownKeys.has(key) && val !== undefined && val !== null) {
        properties.push({ name: `Vera: ${key}`, value: String(val), source: 'vera' });
      }
    }

    // serverurl attribute on the meta tag itself (sometimes duplicated)
    const serverUrlAttr = veraDocsMeta.getAttribute('serverurl');
    if (serverUrlAttr && serverUrlAttr !== veraData.serverUrl) {
      properties.push({ name: 'Vera Server URL (attr)', value: serverUrlAttr, source: 'vera' });
    }

    // Mark the file as Vera-encrypted (classification label)
    classificationLabels.push({
      name: 'Vera Encrypted File',
      value: veraData.docName
        ? `${veraData.docName} — encrypted via Vera (tenant: ${veraData.tenant ?? 'unknown'})`
        : 'Vera encrypted document detected',
      source: 'Vera',
    });
  }

  // Extract other <meta> tags from the <head>
  const metas = doc.querySelectorAll('head meta');
  const skipNames = new Set(['veradocs', 'charset', 'viewport']);
  metas.forEach((meta) => {
    const name = meta.getAttribute('name') ?? meta.getAttribute('http-equiv') ?? '';
    if (!name || skipNames.has(name.toLowerCase())) return;
    const value = meta.getAttribute('content') ?? meta.getAttribute('value') ?? '';
    if (!value || value === '$(CLASSIFICATION)') {
      // Template placeholder — note its existence but skip empty values
      if (name.toLowerCase() === 'classification') {
        properties.push({ name: 'Classification Tag', value: '(template placeholder — not set)', source: 'vera' });
      }
      return;
    }
    const product = identifyClassificationLabel(name);
    const entry: DocumentProperty = {
      name,
      value,
      source: product ? 'classification' : (isVera ? 'vera' : 'html'),
    };
    properties.push(entry);
    if (product) {
      classificationLabels.push({ name, value, source: product });
    }
  });

  // Extract <title>
  const title = doc.querySelector('title')?.textContent?.trim();
  if (title) {
    properties.push({ name: 'Page Title', value: title, source: isVera ? 'vera' : 'html' });
  }

  // Extract linked resources (CSS/JS from Vera server)
  const links = doc.querySelectorAll('link[rel="stylesheet"], script[src]');
  links.forEach((el) => {
    const url = el.getAttribute('href') ?? el.getAttribute('src') ?? '';
    if (url) {
      const tag = el.tagName.toLowerCase() === 'link' ? 'Stylesheet' : 'Script';
      properties.push({ name: `Linked ${tag}`, value: url, source: isVera ? 'vera' : 'html' });
    }
  });

  // Extract visible text for classification scanning
  const body = doc.querySelector('body');
  const text = body?.textContent?.trim() ?? '';

  return {
    text,
    properties,
    classificationLabels,
    fileType: isVera ? 'Vera Encrypted File' : 'HTML',
  };
}

// ── Main entry point ───────────────────────────────────────────────────────

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

export const ACCEPTED_TYPES = '.docx,.xlsx,.pptx,.pdf,.txt,.html,.htm';

export async function parseFile(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const ext = getExtension(file.name);

  let result: ParsedFile;
  switch (ext) {
    case 'docx':
    case 'xlsx':
    case 'pptx':
      result = await parseOfficeFile(buffer, ext);
      break;
    case 'pdf':
      result = await parsePdfFile(buffer);
      break;
    case 'txt':
      result = await parseTxtFile(buffer, file);
      break;
    case 'html':
    case 'htm':
      result = await parseHtmlFile(buffer, file);
      break;
    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }

  // Always include basic file info at the top
  result.properties.unshift(
    { name: 'File Name', value: file.name, source: 'file' },
    { name: 'File Size', value: formatBytes(file.size), source: 'file' },
    { name: 'Last Modified', value: new Date(file.lastModified).toLocaleString(), source: 'file' },
  );

  return result;
}
