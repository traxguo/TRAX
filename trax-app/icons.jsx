/* ============ TRAX — icons + shared bits ============ */
const I = {
  grid:    'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  users:   'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11',
  scan:    'M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10',
  chat:    'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  search:  'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  bell:    'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  bolt:    'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  trend:   'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
  calendar:'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  money:   'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  clock:   'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  check:   'M20 6L9 17l-5-5',
  plus:    'M12 5v14M5 12h14',
  phone:   'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  mail:    'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
  filter:  'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  arrowL:  'M19 12H5M12 19l-7-7 7-7',
  more:    'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  edit:    'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  flame:   'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  snow:    'M12 2v20M17 5l-5 3-5-3M7 19l5-3 5 3M2 12h20M5 7l3 5-3 5M19 7l-3 5 3 5',
  ban:     'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM5 5l14 14',
  card:    'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM2 10h20',
  logout:  'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  send:    'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  whatsapp:'M17.5 14.4c-.3-.15-1.77-.87-2.04-.97s-.47-.15-.67.15-.77.97-.94 1.17-.35.22-.65.07a8.2 8.2 0 0 1-2.4-1.48 9 9 0 0 1-1.67-2.07c-.17-.3 0-.46.13-.61.13-.13.3-.35.45-.52a2 2 0 0 0 .3-.5.55.55 0 0 0 0-.52c-.07-.15-.67-1.62-.92-2.22s-.49-.5-.67-.51h-.57a1.1 1.1 0 0 0-.8.37 3.35 3.35 0 0 0-1.04 2.48c0 1.46 1.06 2.87 1.21 3.07s2.1 3.2 5.08 4.49c2.98 1.28 2.98.85 3.52.8s1.77-.72 2.02-1.42.25-1.3.17-1.42-.27-.2-.57-.35zM12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2z',
  user:    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  chev:    'M9 18l6-6-6-6',
  lock:    'M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4',
  trash:   'M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6M10 11v6M14 11v6',
  x:       'M18 6L6 18M6 6l12 12',
  store:   'M3 9l1.5-5h15L21 9M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M3 9h18M9 20v-6h6v6',
  pin:     'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  eye:     'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeoff:  'M9.9 5.2A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-2.3 3.2M6.6 6.6A16 16 0 0 0 2 12s3.5 7 10 7a9.5 9.5 0 0 0 3.4-.6M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2',
  userplus:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6',
  award:   'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.6L7 22l5-3 5 3-1.2-8.4',
  dumbbell:'M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M6.5 17.5l-4 4M17.5 6.5l4-4',
  cake:    'M4 21h16M4 21v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7M12 12V8M9 4.5a1.5 1.5 0 0 0 3 0c0-1-1.5-2.5-1.5-2.5S9 3.5 9 4.5z',
};

function Icon({ name, size = 18, stroke = 1.8, fill = false, style, className }) {
  const filled = fill || name === 'whatsapp';
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={I[name]} />
    </svg>
  );
}

const T = window.TRAX;

function Avatar({ name, size = 34, radius, cls = 'av-sm' }) {
  const c = T.colorFor(name);
  const st = size ? { width: size, height: size, background: c, fontSize: size*0.38, borderRadius: radius } : { background: c };
  return <div className={cls} style={st}>{T.initials(name)}</div>;
}

function StatusPill({ status }) {
  const map = {
    active:   ['ok',      'Aktif'],
    expiring: ['warn',    'Bitiyor'],
    expired:  ['bad',     'Süresi doldu'],
    frozen:   ['neutral', 'Donduruldu'],
  };
  const [c, label] = map[status] || ['neutral', status];
  return <span className={'pill '+c}><span className="d"></span>{label}</span>;
}

Object.assign(window, { Icon, Avatar, StatusPill, I });
