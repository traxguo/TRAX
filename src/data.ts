// ─────────────────────────────────────────────
//  TRAX – Data Types & Mock Data
// ─────────────────────────────────────────────

export interface PastPayment {
  month: string;
  status: 'paid' | 'partial' | 'unpaid';
}

export type PackageType = 'count' | 'duration';

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  img: string;
  package: string;
  packageType: PackageType;     // 'count' → adet bazlı | 'duration' → süre bazlı
  totalSessions?: number;       // adet paketi için (ör: 10 ders)
  usedSessions?: number;        // kullanılan ders sayısı
  daysRemaining: number;        // calcDays ile hesaplanır
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  totalAmount: number;
  paidAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  pastPayments: PastPayment[];
}

export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    phone: '05321234567',
    email: 'sarah@example.com',
    img: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=1a1a1a&color=D97706&size=200',
    package: '10 Derslik Paket',
    packageType: 'count',
    totalSessions: 10,
    usedSessions: 10,
    daysRemaining: 0,
    paymentStatus: 'unpaid',
    totalAmount: 1500,
    paidAmount: 0,
    startDate: '01.04.2026',
    endDate: '20.04.2026',
    isActive: false,
    pastPayments: [
      { month: 'Nisan 2026', status: 'unpaid' },
      { month: 'Mart 2026',  status: 'paid' },
    ],
  },
  {
    id: '2',
    name: 'Marcus Chen',
    phone: '05559876543',
    email: 'marcus@example.com',
    img: 'https://ui-avatars.com/api/?name=Marcus+Chen&background=1a1a1a&color=D97706&size=200',
    package: 'Aylık Sınırsız',
    packageType: 'duration',
    daysRemaining: 0,
    paymentStatus: 'partial',
    totalAmount: 3000,
    paidAmount: 1500,
    startDate: '01.04.2026',
    endDate: '03.05.2026',
    isActive: true,
    pastPayments: [
      { month: 'Nisan 2026', status: 'partial' },
      { month: 'Mart 2026',  status: 'paid' },
    ],
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    phone: '05443332211',
    email: 'elena@example.com',
    img: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=1a1a1a&color=D97706&size=200',
    package: '5 Derslik Paket',
    packageType: 'count',
    totalSessions: 5,
    usedSessions: 1,
    daysRemaining: 0,
    paymentStatus: 'paid',
    totalAmount: 1500,
    paidAmount: 1500,
    startDate: '01.04.2026',
    endDate: '30.05.2026',
    isActive: true,
    pastPayments: [
      { month: 'Nisan 2026', status: 'paid' },
      { month: 'Mart 2026',  status: 'paid' },
    ],
  },
  {
    id: '4',
    name: 'David Kim',
    phone: '05331112233',
    email: 'david@example.com',
    img: 'https://ui-avatars.com/api/?name=David+Kim&background=1a1a1a&color=D97706&size=200',
    package: '12 Derslik Paket',
    packageType: 'count',
    totalSessions: 12,
    usedSessions: 12,
    daysRemaining: 0,
    paymentStatus: 'paid',
    totalAmount: 2000,
    paidAmount: 2000,
    startDate: '01.01.2026',
    endDate: '15.02.2026',
    isActive: false,
    pastPayments: [
      { month: 'Şubat 2026', status: 'paid' },
      { month: 'Ocak 2026',  status: 'paid' },
    ],
  },
  {
    id: '5',
    name: 'Ayşe Kaya',
    phone: '05441239876',
    email: 'ayse@example.com',
    img: 'https://ui-avatars.com/api/?name=Ayse+Kaya&background=1a1a1a&color=D97706&size=200',
    package: '30 Günlük Paket',
    packageType: 'duration',
    daysRemaining: 0,
    paymentStatus: 'paid',
    totalAmount: 2500,
    paidAmount: 2500,
    startDate: '01.05.2026',
    endDate: '30.05.2026',
    isActive: true,
    pastPayments: [
      { month: 'Mayıs 2026', status: 'paid' },
    ],
  },
];

export const adminAvatar = 'https://ui-avatars.com/api/?name=Admin&background=D97706&color=080808&size=200';
