import Icon from './Icon';

export default function Empty({ ico, text }: { ico: string; text: string }) {
  return (
    <div className="empty">
      <div className="empty-ic"><Icon name={ico} size={20} /></div>
      <div className="empty-tx">{text}</div>
    </div>
  );
}
