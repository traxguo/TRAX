import Icon from './Icon';

interface FldProps {
  label: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  opt?: boolean;
  autoFocus?: boolean;
}

export default function Fld({ label, icon, value, onChange, placeholder, type = 'text', opt, autoFocus }: FldProps) {
  return (
    <label className="fld">
      <span className="fld-l">
        {label}
        {opt && <span className="opt">opsiyonel</span>}
      </span>
      <div className="fld-in">
        <Icon name={icon} size={17} />
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}
