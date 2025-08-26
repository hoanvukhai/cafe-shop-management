// Định nghĩa interface cho từng món
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  available: boolean; // Thêm trường available
}

// Định nghĩa interface cho cấu trúc menu
export interface MenuData {
  [category: string]: MenuItem[];
}

// Dữ liệu menu được tổ chức theo danh mục
export const menu_items: MenuData = {
  coffee: [
    { id: "coffee_001", name: "Đen phin", price: 25000, available: true },
    { id: "coffee_002", name: "Nâu phin", price: 25000, available: true },
    { id: "coffee_003", name: "Bạc xỉu", price: 30000, available: true },
    { id: "coffee_004", name: "Cà phê kem muối", price: 30000, available: true },
    { id: "coffee_005", name: "Cà phê kem trứng", price: 30000, available: true },
    { id: "coffee_006", name: "Đen máy", price: 30000, available: true },
    { id: "coffee_007", name: "Espresso", price: 30000, available: true },
    { id: "coffee_008", name: "Americano", price: 30000, available: true },
    { id: "coffee_009", name: "Nâu máy", price: 35000, available: true },
    { id: "coffee_010", name: "Café Mocha", price: 35000, available: true },
    { id: "coffee_011", name: "Café Latte", price: 40000, available: true },
    { id: "coffee_012", name: "Café Cappuccino", price: 40000, available: true },
    { id: "coffee_013", name: "Café Kem", price: 40000, available: true },
  ],
  milk_tea: [
    { id: "milk_tea_001", name: "Trà sữa Thái xanh", price: 30000, available: true },
    { id: "milk_tea_002", name: "Trà ôlong lài sữa", price: 30000, available: true },
    { id: "milk_tea_003", name: "Sữa tươi TC đường đen", price: 30000, available: true },
    { id: "milk_tea_004", name: "Trà sữa TC đường đen", price: 30000, available: true },
  ],
  matcha: [
    { id: "matcha_001", name: "Trà sữa matcha", price: 30000, available: true },
    { id: "matcha_002", name: "Matcha kem muối", price: 30000, available: true },
    { id: "matcha_003", name: "Matcha latte", price: 30000, available: true },
    { id: "matcha_004", name: "Matcha việt quất", price: 30000, available: true },
    { id: "matcha_005", name: "Matcha cốt dừa", price: 35000, available: true },
  ],
  yogurt: [
    { id: "yogurt_001", name: "Sữa chua lắc đá", price: 30000, available: true },
    { id: "yogurt_002", name: "Sữa chua việt quất", price: 35000, available: true },
    { id: "yogurt_003", name: "Sữa chua đào", price: 35000, available: true },
    { id: "yogurt_004", name: "Sữa chua cà phê", price: 35000, available: true },
    { id: "yogurt_005", name: "Sữa chua trái cây nhiệt đới", price: 35000, available: true },
  ],
  blended: [
    { id: "blended_001", name: "Oreo đá xay", price: 40000, available: true },
    { id: "blended_002", name: "Café đá xay", price: 45000, available: true },
    { id: "blended_003", name: "Vải đá xay", price: 45000, available: true },
    { id: "blended_004", name: "Matcha đá xay", price: 40000, available: true },
    { id: "blended_005", name: "Café cốt dừa", price: 40000, available: true },
    { id: "blended_006", name: "Milo dầm", price: 35000, available: true },
    { id: "blended_007", name: "Chanh tuyết", price: 35000, available: true },
  ],
  fruit_tea: [
    { id: "fruit_tea_001", name: "Trà chanh nha đam", price: 20000, available: true },
    { id: "fruit_tea_002", name: "Trà tắc nha đam", price: 20000, available: true },
    { id: "fruit_tea_003", name: "Trà trái cây nhiệt đới", price: 30000, available: true },
    { id: "fruit_tea_004", name: "Trà vải chanh dây", price: 35000, available: true },
    { id: "fruit_tea_005", name: "Trà đào cam sả", price: 35000, available: true },
    { id: "fruit_tea_006", name: "Trà xoài chanh leo", price: 35000, available: true },
    { id: "fruit_tea_007", name: "Hồng trà cam xí muội", price: 35000, available: true },
    { id: "fruit_tea_008", name: "Trà vải", price: 35000, available: true },
    { id: "fruit_tea_009", name: "Trà nhãn", price: 35000, available: true },
  ],
  smoothie: [
    { id: "smoothie_001", name: "Sinh tố dâu tây", price: 40000, available: true },
    { id: "smoothie_002", name: "Sinh tố xoài", price: 40000, available: true },
    { id: "smoothie_003", name: "Sinh tố bơ", price: 40000, available: true },
    { id: "smoothie_004", name: "Sinh tố bơ dừa", price: 45000, available: true },
    { id: "smoothie_005", name: "Sinh tố bơ Sầu", price: 45000, available: true },
  ],
  hot_drinks: [
    { id: "hot_drinks_001", name: "Trà Thái Nguyên", price: 20000, available: true },
    { id: "hot_drinks_002", name: "Trà gừng táo đỏ", price: 20000, available: true },
    { id: "hot_drinks_003", name: "Trà hương cúc long nhãn", price: 20000, available: true },
    { id: "hot_drinks_004", name: "Trà hồng đào táo nhân lòng", price: 20000, available: true },
    { id: "hot_drinks_005", name: "Ca cao nóng", price: 30000, available: true },
  ],
  ice_cream: [
    { id: "ice_cream_001", name: "Kem 2 viên", price: 25000, available: true },
    { id: "ice_cream_002", name: "Kem 3 viên", price: 35000, available: true },
  ],
  juice: [
    { id: "juice_001", name: "Nước ép dứa", price: 35000, available: true },
    { id: "juice_002", name: "Nước ép chanh dây", price: 30000, available: true },
    { id: "juice_003", name: "Nước ép dưa hấu", price: 30000, available: true },
    { id: "juice_004", name: "Nước ép ổi", price: 30000, available: true },
    { id: "juice_005", name: "Nước ép táo", price: 35000, available: true },
    { id: "juice_006", name: "Nước ép cam", price: 35000, available: true },
    { id: "juice_007", name: "Trái dừa", price: 30000, available: true },
    { id: "juice_008", name: "Đĩa hoa quả", price: 50000, available: true },
    { id: "juice_009", name: "Nước chanh", price: 20000, available: true },

  ],
  snacks: [
    { id: "snacks_001", name: "Hướng dương", price: 10000, available: true },
    { id: "snacks_002", name: "Bỏng ngô", price: 25000, available: true },
    { id: "snacks_003", name: "Khô bò", price: 25000, available: true },
    { id: "snacks_004", name: "Khô gà", price: 25000, available: true },
    { id: "snacks_005", name: "Hướng dương vị dừa", price: 10000, available: true },
    { id: "snacks_006", name: "Trâu gác bếp", price: 30000, available: true },
    { id: "snacks_007", name: "Ngô cay", price: 15000, available: true },
  ],
  special_drinks: [
    { id: "special_drinks_001", name: "TRÀ TRÁI CÂY NHIỆT ĐỚI", price: 30000, available: true },
    { id: "special_drinks_002", name: "DỪA CỐT CÀ PHÊ", price: 40000, available: true },
    { id: "special_drinks_003", name: "CHANH TUYẾT", price: 35000, available: true },
    { id: "special_drinks_004", name: "CÀ PHÊ KEM Ý (affogato)", price: 40000, available: true },
    { id: "special_drinks_005", name: "Không rõ", price: 0, available: true },
  ],
};

export default menu_items;