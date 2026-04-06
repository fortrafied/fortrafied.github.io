/**
 * Shared utilities for exporting tool results as JSON or CSV.
 */

export function downloadJSON(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  triggerDownload(blob, filename);
}

export function downloadCSV(headers: string[], rows: string[][], filename: string) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(row.map(escape).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  triggerDownload(blob, filename);
}

export function copyJSON(data: unknown): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  return navigator.clipboard.writeText(json);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
