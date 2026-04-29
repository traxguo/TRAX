export interface PastPayment {
  month: string;
  status: 'paid' | 'partial' | 'unpaid';
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  img: string;
  package: string;
  daysRemaining: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  totalAmount: number;
  paidAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  pastPayments: PastPayment[];
}

// Tarihler her zaman GELECEKTE olmalı ki calcDays düzgün test edilebilsin
// daysRemaining değeri App.tsx'te calcDays ile üzerine yazılıyor — buradaki değer önemsiz
export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    phone: '05321234567',
    email: 'sarah@example.com',
    img: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=1a1a1a&color=D97706&size=200',
    package: '10 Derslik Paket',
    daysRemaining: 0,        // calcDays endDate'ten hesaplayacak
    paymentStatus: 'unpaid',
    totalAmount: 1500,
    paidAmount: 0,
    startDate: '01.04.2026',
    endDate: '20.04.2026',   // geçmiş → kırmızı
    isActive: false,
    pastPayments: [
      { month: 'Nisan 2026', status: 'unpaid' },
      { month: 'Mart 2026',  status: 'paid'   },
    ],
  },
  {
    id: '2',
    name: 'Marcus Chen',
    phone: '05559876543',
    email: 'marcus@example.com',
    img: 'https://ui-avatars.com/api/?name=Marcus+Chen&background=1a1a1a&color=D97706&size=200',
    package: 'Aylık Sınırsız',
    daysRemaining: 0,
    paymentStatus: 'partial',
    totalAmount: 3000,
    paidAmount: 1500,
    startDate: '01.04.2026',
    endDate: '03.05.2026',   // 4 gün → sarı
    isActive: true,
    pastPayments: [
      { month: 'Nisan 2026', status: 'partial' },
      { month: 'Mart 2026',  status: 'paid'    },
    ],
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    phone: '05443332211',
    email: 'elena@example.com',
    img: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=1a1a1a&color=D97706&size=200',
    package: '5 Derslik Paket',
    daysRemaining: 0,
    paymentStatus: 'paid',
    totalAmount: 1500,
    paidAmount: 1500,
    startDate: '01.04.2026',
    endDate: '30.05.2026',   // 31 gün → yeşil
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
    daysRemaining: 0,
    paymentStatus: 'paid',
    totalAmount: 2000,
    paidAmount: 2000,
    startDate: '01.01.2026',
    endDate: '15.02.2026',   // geçmiş → kırmızı
    isActive: false,
    pastPayments: [
      { month: 'Şubat 2026', status: 'paid' },
      { month: 'Ocak 2026',  status: 'paid' },
    ],
  },
];

export const revenueData = [
  { value: 850 }, { value: 920 }, { value: 890 },
  { value: 1050 }, { value: 1100 }, { value: 1180 }, { value: 1250 },
];

export const adminAvatar = 'https://ui-avatars.com/api/?name=Admin&background=D97706&color=080808&size=200';
