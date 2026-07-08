import { useStore } from '../store';
import { useT } from '../i18n';
import { LEGAL, type LegalKind } from '../legal';
import Sheet from './Sheet';

interface LegalSheetProps {
  kind: LegalKind | null;
  onClose: () => void;
}

export default function LegalSheet({ kind, onClose }: LegalSheetProps) {
  const { lang } = useStore();
  const t = useT();
  if (!kind) return null;
  const sections = LEGAL[lang][kind];

  return (
    <Sheet open fullscreen onClose={onClose}
      eyebrow="TRAX"
      title={kind === 'terms' ? t.termsTitle : t.privacyTitle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 10 }}>
        {sections.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: i === 0 ? 0 : 14, fontWeight: 700, marginBottom: 6 }}>{i === 0 ? '' : s.h}</div>
            <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.65, whiteSpace: 'pre-wrap', color: 'var(--tx-2)' }}>{s.b}</div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
