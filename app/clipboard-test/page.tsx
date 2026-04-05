import type { Metadata } from 'next';
import ClipboardTestClient from './ClipboardTestClient';

export const metadata: Metadata = { title: 'Clipboard / Paste Test' };

export default function Page() {
  return <ClipboardTestClient />;
}
