export interface User {
  userId: string;
  name: string;
  role: 'employee' | 'admin';
  salaryPerHour: number;
}

export const users: User[] = [
  { userId: 'user1', name: 'Bảo', role: 'employee', salaryPerHour: 25000 },
  { userId: 'user2', name: 'Thắng', role: 'employee', salaryPerHour: 20000 },
  { userId: 'user3', name: 'Đạt', role: 'employee', salaryPerHour: 20000 },
  { userId: 'user4', name: 'Hoàn', role: 'employee', salaryPerHour: 20000 },
  { userId: 'user5', name: 'Hoan', role: 'employee', salaryPerHour: 20000 },
  { userId: 'user6', name: 'Lành', role: 'employee', salaryPerHour: 20000 }, 
  { userId: 'user7', name: 'Admin', role: 'admin', salaryPerHour: 0 }
];