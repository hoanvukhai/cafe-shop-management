export interface Task {
  id: string;
  description: string;
  section: 'morning' | 'afternoon' | 'weekly';
  frequency?: number; // Số ngày giữa các lần thực hiện (cho công việc định kỳ)
}

export const tasks: Task[] = [
  // Ca sáng
  { id: 'morning_task_1', description: 'Mở cửa chính, cửa quầy bar, bật đèn, bật máy pha cà phê, bật bình đun nước.', section: 'morning' },
  { id: 'morning_task_2', description: 'Kiểm tra điện các tủ lạnh, tủ đông xem tình trạng hoạt động.', section: 'morning' },
  { id: 'morning_task_3', description: 'Kiểm hàng hóa, hoa quả (còn/ hết/ chất lượng).', section: 'morning' },
  { id: 'morning_task_4', description: 'Kê xếp bàn ghế ngay ngắn theo đúng sơ đồ.', section: 'morning' },
  { id: 'morning_task_5', description: 'Lau cửa kính.', section: 'morning' },
  { id: 'morning_task_6', description: 'Lau bàn, ghế - quét nền - dọn toàn bộ khu vực bán hàng.', section: 'morning' },
  { id: 'morning_task_7', description: 'Kiểm tiền vốn để lại từ hôm trước.', section: 'morning' },
  { id: 'morning_task_8', description: 'Luôn chủ động nhận biết khách vào để chào đón tiếp và phục vụ bán hàng.', section: 'morning' },
  { id: 'morning_task_9', description: 'Kiểm tra hàng bán, vật dụng, vật tư để yêu cầu nhập hàng.', section: 'morning' },
  { id: 'morning_task_10', description: 'Dọn dẹp quầy, khu vực bán hàng sạch sẽ, rửa hết cốc bẩn.', section: 'morning' },
  { id: 'morning_task_11', description: 'Làm thủ tục bàn giao ca, tiền thu được trong ca và tiền vốn.', section: 'morning' },
  { id: 'morning_task_12', description: 'Bật nhạc cho khách trong quán.', section: 'morning' },
  // Ca chiều
  { id: 'afternoon_task_1', description: 'Nhận bàn giao ca sau khi đã được vệ sinh khu vực làm việc sạch sẽ.', section: 'afternoon' },
  { id: 'afternoon_task_2', description: 'Thực hiện các mục công việc như của ca sáng.', section: 'afternoon' },
  { id: 'afternoon_task_3', description: 'Kiểm hàng hóa, hoa quả (còn/ hết/ chất lượng).', section: 'afternoon' },
  { id: 'afternoon_task_4', description: 'Luôn chủ động nhận biết khách vào để chào đón tiếp và phục vụ bán hàng.', section: 'afternoon' },
  { id: 'afternoon_task_5', description: 'Làm quy trình đóng cửa.', section: 'afternoon' },
  { id: 'afternoon_task_6', description: 'Kiểm tra hàng bán, vật dụng, vật tư để yêu cầu nhập hàng.', section: 'afternoon' },
  { id: 'afternoon_task_7', description: 'Rửa các dụng cụ pha chế: Cốc tách, bình lắc, máy xay, máy ép, máy pha cà phê.', section: 'afternoon' },
  { id: 'afternoon_task_8', description: 'Tắt máy pha cà phê.', section: 'afternoon' },
  { id: 'afternoon_task_9', description: 'Đánh bồn rửa cốc.', section: 'afternoon' },
  { id: 'afternoon_task_10', description: 'Sắp xếp gọn đồ trong tủ lạnh.', section: 'afternoon' },
  { id: 'afternoon_task_11', description: 'Quét và lau quầy.', section: 'afternoon' },
  { id: 'afternoon_task_12', description: 'Cất đá vào tủ lạnh nếu còn.', section: 'afternoon' },
  { id: 'afternoon_task_13', description: 'Kiểm tra tình trạng hoạt động các tủ lạnh, kem.', section: 'afternoon' },
  { id: 'afternoon_task_14', description: 'Bàn giao tiền thu được trong ngày cho chủ quán.', section: 'afternoon' },
  { id: 'afternoon_task_15', description: 'Bật nhạc cho khách trong quán.', section: 'afternoon' },
  // Định kỳ
  { id: 'weekly_task_1', description: 'Dọn tủ đông, tủ lạnh 1 tuần 1 lần.', section: 'weekly', frequency: 7},
  { id: 'weekly_task_2', description: 'Tưới cây 1 tuần 2 lần.', section: 'weekly', frequency: 3},
  { id: 'weekly_task_3', description: 'Lau lá cây 1 tuần 1 lần.', section: 'weekly', frequency: 7},
];