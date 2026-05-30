import Sheet from './Sheet';
import Icon from './Icon';

interface ConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  name?: string;
  onConfirm: () => void;
}

export default function ConfirmSheet({ open, onClose, name, onConfirm }: ConfirmSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} eyebrow="Onay" title="Üyeyi sil">
      <div className="confirm-ic"><Icon name="trash" size={26} /></div>
      <p style={{ textAlign: 'center', color: 'var(--tx-2)', fontSize: 14.5, lineHeight: 1.55, margin: '4px 8px 4px' }}>
        <b style={{ color: 'var(--tx)' }}>{name}</b> kalıcı olarak silinecek. Bu işlem geri alınamaz.
      </p>
      <div className="row" style={{ gap: 10, marginTop: 18 }}>
        <button className="btn" onClick={onClose}>Vazgeç</button>
        <button className="btn danger solid" onClick={() => { onConfirm(); onClose(); }}>
          <Icon name="trash" size={16} />Sil
        </button>
      </div>
    </Sheet>
  );
}
