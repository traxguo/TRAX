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

export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    phone: '+90 532 123 45 67',
    email: 'sarah@example.com',
    img: 'https://images.unsplash.com/photo-1759476529288-cc6bbde6f0a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGF0aGxldGljJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzY3MTIzODF8MA&ixlib=rb-4.1.0&q=80&w=200',
    package: '10 Derslik Paket',
    daysRemaining: -2,
    paymentStatus: 'unpaid',
    totalAmount: 1500,
    paidAmount: 0,
    startDate: '01.02.2026',
    endDate: '15.03.2026',
    isActive: false,
    pastPayments: [
      { month: 'Şubat 2026', status: 'unpaid' },
      { month: 'Ocak 2026', status: 'paid' }
    ]
  },
  {
    id: '2',
    name: 'Marcus Chen',
    phone: '+90 555 987 65 43',
    email: 'marcus@example.com',
    img: 'https://images.unsplash.com/flagged/photo-1596479042555-9265a7fa7983?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NjY1MzA2Mnww&ixlib=rb-4.1.0&q=80&w=200',
    package: 'Aylık Sınırsız',
    daysRemaining: 4,
    paymentStatus: 'partial',
    totalAmount: 3000,
    paidAmount: 1500,
    startDate: '20.03.2026',
    endDate: '24.04.2026',
    isActive: true,
    pastPayments: [
      { month: 'Mart 2026', status: 'partial' },
      { month: 'Şubat 2026', status: 'paid' }
    ]
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    phone: '+90 544 333 22 11',
    email: 'elena@example.com',
    img: 'https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDF8fHx8MTc3NjcxMjM3N3ww&ixlib=rb-4.1.0&q=80&w=200',
    package: '5 Derslik Paket',
    daysRemaining: 15,
    paymentStatus: 'paid',
    totalAmount: 1500,
    paidAmount: 1500,
    startDate: '10.04.2026',
    endDate: '25.04.2026',
    isActive: true,
    pastPayments: [
      { month: 'Nisan 2026', status: 'paid' },
      { month: 'Mart 2026', status: 'paid' }
    ]
  },
  {
    id: '4',
    name: 'David Kim',
    phone: '+90 533 111 22 33',
    email: 'david@example.com',
    img: 'https://images.unsplash.com/photo-1758875569897-5e214ccc4e17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGZpdCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NjcxMjM4MXww&ixlib=rb-4.1.0&q=80&w=200',
    package: '12 Derslik Paket',
    daysRemaining: -10,
    paymentStatus: 'paid',
    totalAmount: 2000,
    paidAmount: 2000,
    startDate: '01.01.2026',
    endDate: '28.02.2026',
    isActive: false,
    pastPayments: [
      { month: 'Şubat 2026', status: 'paid' },
      { month: 'Ocak 2026', status: 'paid' }
    ]
  },
];

export const revenueData = [
  { value: 850 },
  { value: 920 },
  { value: 890 },
  { value: 1050 },
  { value: 1100 },
  { value: 1180 },
  { value: 1250 }
];

export const adminAvatar = "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDF8fHx8MTc3NjcxMjM3N3ww&ixlib=rb-4.1.0&q=80&w=200";