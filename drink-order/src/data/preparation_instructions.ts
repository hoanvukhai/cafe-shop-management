// src/data/preparation_instructions.ts

// Định nghĩa interface cho nguyên liệu, dụng cụ, bước thực hiện, ghi chú và thành phẩm
export interface PreparationStep {
  ingredients?: string[];
  equipment?: string[];
  steps: string[];
  yield?: string;
  notes?: string;
}

// Định nghĩa interface cho cấu trúc công thức sơ chế
export interface PreparationInstruction {
  name: string;
  preparation: PreparationStep;
}

// Định nghĩa interface cho danh sách các công thức sơ chế
export interface PreparationInstructions {
  [key: string]: PreparationInstruction;
}

// Dữ liệu hướng dẫn sơ chế
export const preparationInstructions: PreparationInstructions = {
  sugar_syrup: {
    name: "Đường nước",
    preparation: {
      ingredients: ["1kg đường cát", "600ml nước sôi"],
      steps: [
        "Cho đường và nước sôi vào trong ca và khuấy tan đến khi hỗn hợp nước đường tan hết và màu trong là được",
        "Bảo quản ở nhiệt độ thường hoặc trong tủ mát"
      ],
      yield: "1200ml"
    }
  },
  large_phin_coffee: {
    name: "Pha phin lớn",
    preparation: {
      ingredients: [
        "Bộ phin lớn",
        "150gr cà phê bột xay sẵn",
        "Ca nhựa 1.5lit",
        "600ml nước sôi"
      ],
      steps: [
        "Tỉ lệ nước 1:4 [1 lần cà phê 4 lần nước]",
        "Cho 150 gram bột cà phê vào phin và lắc nhẹ để dàn phẳng bề mặt",
        "Rót vào 200ml nước sôi (98 độ C) để cà phê hút ngược hết nước, đặt đế vào miệng ca nhựa sau đó đặt phin cà phê sau khi nước dưới nắp đã được hút hết",
        "Đun sôi lại nước rót vào trong phin 200ml nước sôi theo hình xoắn trôn ốc đậy nắp để ủ cà phê 3 phút – 5 phút",
        "Đun sôi lại nước và châm tiếp 200ml nước là vừa sau đó đậy nắp và chờ cà phê nhỏ giọt, kiểm soát tốc độ chảy của cà phê khoảng 1 giây 1 giọt",
        "Theo dõi dòng chảy của cà phê sao cho cà phê chảy trong khoảng 20 phút – 25 phút. Sau khi cà phê chiết xuất xong đổ vào chai bảo quản"
      ],
      yield: "gần 400ml"
    }
  },
  peach_tea_base: {
    name: "Nước cốt trà đào",
    preparation: {
      ingredients: ["1 gói trà đào", "600ml nước sôi", "300gr đá viên"],
      equipment: ["Bình giữ nhiệt trà/ ca nhựa", "Bar spoon", "Kẹp inox"],
      steps: [
        "Cho túi trà đào vào bình giữ nhiệt",
        "Rót nước sôi vào bình theo định lượng",
        "Ủ trà trong 15 phút sau đó vớt túi trà ra",
        "Cho đá vào sóc nhiệt trà và khuấy tan"
      ],
      notes: "Có thể tăng định lượng"
    }
  },
  jasmine_tea_base: {
    name: "Nước cốt trà lài",
    preparation: {
      ingredients: ["1 gói trà lài", "1000ml nước sôi", "300gr đá viên"],
      equipment: ["Bình giữ nhiệt trà/ ca nhựa", "Bar spoon", "Kẹp inox"],
      steps: [
        "Cho túi trà lài vào bình giữ nhiệt",
        "Rót nước sôi vào bình theo định lượng",
        "Ủ trà trong 15 phút sau đó vớt túi trà ra",
        "Cho đá vào sóc nhiệt trà và khuấy tan"
      ],
      yield: "1200ml",
      notes: "Có thể tăng định lượng"
    }
  },
  oolong_jasmine_milk_tea: {
    name: "Trà ôlong lài sữa",
    preparation: {
      ingredients: [
        "25gr trà Ôlong",
        "1 túi trà nhài",
        "1600ml nước sôi",
        "150gr bột sữa",
        "50gr bột đá xay",
        "250gr đường cát trắng"
      ],
      equipment: ["Ca nhựa", "Cây khuấy", "Túi lọc trà", "Kẹp inox"],
      steps: [
        "Cho 2 loại trà vào ca nhựa, rót nước sôi",
        "Ủ trà trong 15 phút sau đó vớt túi trà ra",
        "Cho bột sữa, bột đá xay, đường cát theo định lượng vào nồi cốt trà khuấy tan",
        "Để nguội hỗn hợp trà sữa sau đó đổ ra bình nhựa cất vào tủ lạnh"
      ],
      yield: "1700ml"
    }
  },
  thai_green_milk_tea: {
    name: "Trà sữa Thái xanh",
    preparation: {
      ingredients: [
        "25gr trà Thái xanh",
        "1 túi trà nhài",
        "1600ml nước sôi",
        "150gr bột sữa",
        "50gr bột đá xay",
        "250gr đường cát trắng"
      ],
      equipment: ["Ca nhựa", "Cây khuấy", "Túi lọc trà", "Kẹp inox"],
      steps: [
        "Cho 2 loại trà vào ca nhựa, rót nước sôi",
        "Ủ trà trong 15 phút sau đó vớt túi trà ra, dùng kẹp ép hết nước cốt từ túi lọc trà",
        "Cho bột sữa, bột đá xay, đường cát theo định lượng vào nồi cốt trà khuấy tan",
        "Để nguội hỗn hợp trà sữa sau đó đổ ra bình nhựa cất vào tủ lạnh"
      ],
      yield: "1700ml"
    }
  },
  egg_cream: {
    name: "Kem trứng",
    preparation: {
      ingredients: [
        "100ml kem béo Rich lùn",
        "200ml sữa tươi",
        "30gr bột đá xay",
        "60gr bột trứng",
        "30gr đường cát trắng"
      ],
      equipment: ["Máy đánh trứng", "Ca nhựa 1lit"],
      steps: [
        "Cho tất cả các nguyên liệu theo định lượng vào ca",
        "Dùng máy đánh trứng đánh bông hỗn hợp tốc độ từ chậm cho đến nhanh kéo dài trong 3 phút"
      ]
    }
  },
  mixed_fruit: {
    name: "Trái cây hỗn hợp",
    preparation: {
      ingredients: [
        "600gr dứa",
        "600gr xoài chín vàng",
        "250gr tắc",
        "500gr cam vàng",
        "250gr ruột chanh dây",
        "250gr dâu tây",
        "250gr dưa lưới",
        "200ml nước cam sành",
        "50ml chanh tươi",
        "600gr đường cát trắng",
        "2gr muối"
      ],
      steps: [
        "Rửa sạch tắc tươi, cam vàng để ráo nước hoặc dùng khăn giấy thấm khô",
        "Dứa gọt bỏ mắt, xoài chín gọt vỏ",
        "Cam sành vắt lấy nước, chanh dây cắt lấy ruột bên trong, các trái cây khác cắt tam giác hoặc hạt lựu độ dày 1.5cm, tắc tươi cắt đôi bỏ hạt",
        "Cho hết các loại trái cây đã cắt vào hộp chứa sau đó cân 500gr đường rải đều, một ít muối và đảo cho trái cây thấm đường để ướp 15 phút",
        "Cho vào máy xay sinh tố 100gr xoài 100gr dứa 200ml nước cam sành xay nhuyễn",
        "Cho vào nồi hỗn hợp vừa xay và chanh dây, nước cốt chanh, 100gr đường đun sôi hỗn hợp sau đó đổ hỗn hợp vừa nấu vào trong hộp chứa trái cây đang ướp",
        "Để nguội và tiếp tục đảo đều, đậy nắp và bảo quản trong tủ mát"
      ],
      notes: "Ngâm trái cây trước 4 tiếng hoặc qua đêm sau đó mới lấy ra bán chất lượng"
    }
  }
};

// Thêm dòng này
export default preparationInstructions;