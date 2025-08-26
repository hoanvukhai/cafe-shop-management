// src/data/recipes.ts

// Định nghĩa interface cho công thức
export interface RecipeStep {
  steps: string[];
  serving_tools?: string[];
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  preparation: RecipeStep;
}

// Định nghĩa interface cho danh sách công thức
export interface Recipes {
  recipes: Recipe[];
}

// Dữ liệu công thức pha chế
export const recipes: Recipes = {
  recipes: [
    {
      id: "coffee_001",
      name: "Đen phin",
      preparation: {
        steps: [
          "Làm nóng phin",
          "Cho 20g cà phê vào phin",
          "Lần 1 rót 30ml nước sôi vào nắp bên dưới và rót nhẹ vào phin",
          "Chuẩn bị tách, đĩa lót tách, thìa, đường và đặt phin lên tách",
          "Lần 2 rót nốt 50ml nước sôi vào phin"
        ],
        serving_tools: ["Thìa cà phê"],
        notes: "Tỉ lệ 1:4"
      }
    },
    {
      id: "coffee_002",
      name: "Nâu phin",
      preparation: {
        steps: [
          "Làm nóng phin",
          "Cho 20g cà phê vào phin",
          "Lần 1 lấy 30ml nước sôi rót vào nắp bên dưới và rót nhẹ vào phin",
          "Chuẩn bị tách, đĩa lót tách, thìa (đặt song song quai tách)",
          "Bơm 1,5 bơm (15ml) sữa đặc vào tách và đặt phin lên tách",
          "Lần 2 rót nốt 50ml nước sôi vào phin (rót nhẹ tưới xung quanh)"
        ],
        serving_tools: ["Thìa cà phê"],
        notes: "Tỉ lệ 1:4"
      }
    },
    {
      id: "coffee_003",
      name: "Bạc xỉu",
      preparation: {
        steps: [
          "1. sz 350ml",
          "10ml Rich",
          "30 sữa đặc",
          "50 sữa tươi",
          "130 sữa nhỏ",
          "35-40 cafe đánh bọt đổ lên thìa",
          "2. sr 500ml",
          "40 sữa đặc", 
          "50 sữa tươi", 
          "250 đá viên nhỏ", 
          "50 cafe đánh bọt",
          "Đổ lên cốc"
        ],
        serving_tools: ["Thìa", "Ống hút"]
      }
    },
    {
      id: "coffee_004",
      name: "Cà phê kem muối",
      preparation: {
        steps: [
          "1. Cách cũ",
          "Lấy cốc phục vụ cà phê kem muối",
          "Rót 50ml cà phê",
          "Bơm 2 bơm sữa đặc (20ml)",
          "Khuấy đều",
          "Cho đá nửa ly",
          "Chuẩn bị ca đánh cho vào gồm: 30ml Rich lùn, 10ml sữa tươi, 0,03 gr muối",
          "Lấy cây đánh bọt đánh bông mịn",
          "Rót phần kem muối lên trên",
          "Rắc bột ca cao",
          "2. Cách mới",
          "Cốc 350ml", 
          "35 sữa đặc", 
          "45 cafe => đánh bông", 
          "Đá đầy ly", 
          "50 kem mặn + bột cacao"
        ],
        serving_tools: ["Thìa", "Ống hút"]
      }
    },
    {
      id: "coffee_005",
      name: "Cà phê kem trứng",
      preparation: {
        steps: [
          "Lấy cốc phục vụ cà phê kem trứng",
          "Rót 60ml cà phê",
          "Bơm 2 bơm sữa đặc (20ml)",
          "Khuấy đều",
          "Cho đá nửa ly",
          "Rót 40ml/gr kem trứng đã được đánh sẵn lên",
          "Rắc bột ca cao"
        ],
        serving_tools: ["Thìa", "Ống hút"]
      }
    },
    {
      id: "coffee_006",
      name: "Đen máy",
      preparation: {
        steps: [
          "Lấy tay đơn, xay cà phê, nén",
          "Xả nước, lắp tay đơn vào máy",
          "Lấy tách hoặc ca đong",
          "Chiết xuất lấy 30ml cà phê",
          "Đen máy đá: Cho vào cốc đá, thêm 150ml nước lọc",
          "Đen máy nóng: Phục vụ trong tách nóng"
        ],
        serving_tools: ["Thìa cà phê (nóng)", "Ống hút (đá)"]
      }
    },
    {
      id: "coffee_007",
      name: "Espresso",
      preparation: {
        steps: [
          "Lấy tay đơn, xay cà phê, nén",
          "Xả nước, lắp tay đơn vào máy",
          "Lấy tách hoặc ca đong",
          "Chiết xuất lấy 30ml cà phê",
          "Espresso: Phục vụ trực tiếp trong tách",
        ],
        serving_tools: [
          "Tách, đĩa lót, thìa cà phê",
          "1 gói đường"
        ]
      }
    },
    {
      id: "coffee_008",
      name: "Americano",
      preparation: {
        steps: [
          "Lấy tay đơn, xay cà phê, nén",
          "Xả nước, lắp tay đơn vào máy",
          "Lấy tách hoặc ca đong",
          "Chiết xuất lấy 30ml cà phê",
          "Americano đá: Cho vào cốc đá, thêm 250ml nước lọc",
          "Americano nóng: Thêm 150ml nước nóng vào tách"
        ],
        serving_tools: [
          "Tách, đĩa lót, thìa cà phê (Americano nóng)",
          "Ống hút (Americano đá)",
          "1 gói đường"
        ]
      }
    },
    {
      id: "coffee_009",
      name: "Nâu máy",
      preparation: {
        steps: [
          "Lấy tay đôi, xay cà phê, nén",
          "Xả nước, lắp tay đôi vào máy",
          "Lấy ca đong",
          "Chiết xuất lấy 60ml cà phê",
          "đá: 15 – 20 sữa đặc vào ly, 60ml cafe chắt thẳng vào ly",
          "nóng: 60ml cafe làm nguội, 15-20 sữa đặc, Đá viên lên trên"
        ],
        serving_tools: ["Ống hút (đá)", "Thìa cà phê (nóng)", "1 gói đường", "Phục vụ lót đĩa + thìa"]
      }
    },
    {
      id: "coffee_010",
      name: "Café Mocha",
      preparation: {
        steps: [
          "Nóng: Lấy tay đơn, xay cà phê, nén",
          "Xả nước, lắp tay đơn vào máy",
          "Lấy tách",
          "Chiết xuất lấy 30ml cà phê",
          "Rót 15ml sauce Chocolate vào tách",
          "Khuấy",
          "Lấy 120ml sữa tươi, đánh nóng bằng vòi sữa rót vào tách cà phê",
          "Rắc bột cacao lên trên cùng",
          "Đá: 30ml socola xốt, 20ml đường, đá đầy ly, sữa tươi đến vạch đầu ly, chiết xuất 60ml cà phê đổ lên trên cùng"
        ],
        serving_tools: ["Thìa cà phê (nóng)", "Ống hút (đá)"]
      }
    },
    {
      id: "coffee_011",
      name: "Café Latte",
      preparation: {
        steps: [
          "Lấy tay đơn, xay cà phê, nén",
          "Xả nước, lắp tay đơn vào máy",
          "Lấy tách",
          "Chiết xuất lấy 30ml cà phê",
          "Lấy 120ml sữa tươi, đánh nóng bằng vòi sữa rót vào tách cà phê",
          "Đá: Lấy 120ml sữa tươi, 20ml sữa đặc, đá đầy ly, chiết xuất 60ml cà phê đổ lên trên"
        ],
        serving_tools: ["Thìa cà phê (nóng)", "Ống hút (đá)", "1 gói đường"]
      }
    },
    {
      id: "coffee_012",
      name: "Café Cappuccino",
      preparation: {
        steps: [
          "Lấy tay đơn, xay cà phê, nén",
          "Xả nước, lắp tay đơn vào máy",
          "Lấy tách",
          "Chiết xuất lấy 30ml cà phê",
          "Lấy 120ml sữa tươi, đánh nóng bằng vòi sữa rót vào tách cà phê",
          "Đá: 60 cafe máy(làm nguội), 120 sữa tươi lắc đều, 70 đá viên nhỏ lắc đều, Vào cốc với đổ cafe lên, Kèm thêm đường – lót đĩa",
          "Nóng: 30ml cafe máy, 120ml sữa tươi, đánh nóng rót vào ly tạo hình"
        ],
        serving_tools: ["Thìa cà phê (nóng)", "Ống hút (đá)", "1 gói đường", "Lót đĩa"]
      }
    },
    {
      id: "coffee_013",
      name: "Café Kem",
      preparation: {
        steps: [
          "Lấy tay đôi, xay cà phê, nén",
          "Xả nước, lắp tay đôi vào máy",
          "Chiết xuất lấy 60ml cà phê",
          "Cho vào cốc đá, thêm 20ml sữa đặc, khuấy đều",
          "Thêm 1 viên kem vani (60gr) lên trên",
          "Rắc bột cacao"
        ],
        serving_tools: ["Thìa", "Ống hút"]
      }
    },
    {
      id: "milk_tea_001",
      name: "Trà sữa Thái xanh",
      preparation: {
        steps: [
          "Múc 1 thìa trân châu (40gr)",
          "Cho đá",
          "Rót cốt trà Thái",
          "Rót kem trứng lên trên cùng"
        ],
        serving_tools: ["Ống hút to"],
        notes: "Dùng cốc size M hoặc cốc thủy tinh có quai"
      }
    },
    {
      id: "milk_tea_002",
      name: "Trà ôlong lài sữa",
      preparation: {
        steps: [
          "Múc 1 thìa trân châu (40gr)",
          "Cho đá",
          "Rót cốt trà ô long",
          "Rót kem trứng lên trên cùng"
        ],
        serving_tools: ["Ống hút to"],
        notes: "Dùng cốc size M hoặc cốc thủy tinh có quai"
      }
    },
    {
      id: "milk_tea_003",
      name: "Sữa tươi TC đường đen",
      preparation: {
        steps: [
          "Múc 1 thìa trân châu (40gr)",
          "20ml đường đen",
          "Cho đá",
          "200ml sữa tươi",
          "10ml kem béo Rich"
        ],
        serving_tools: ["Ống hút to"],
        notes: "cốc thủy tinh có quai"
      }
    },
    {
      id: "milk_tea_004",
      name: "Trà sữa TC đường đen",
      preparation: {
        steps: [
          "Tưới trân châu đường đen lên thành",
          "40g trân châu",
          "Đá",
          "40ml ôlong lài sữa",
        ],
        serving_tools: ["Ống hút to"],
        notes: ""
      }
    },
    {
      id: "matcha_001",
      name: "Trà sữa matcha",
      preparation: {
        steps: [
          "40g trân châu",
          "Đá",
          "150ml ôlong lài sữa",
          "2g matcha và 60ml nước sôi",
          "Đổ matcha lên trên"
        ],
        serving_tools: ["Ống hút to"],
        notes: "cốc thủy tinh có quai"
      }
    },
    {
      id: "matcha_002",
      name: "Matcha kem muối",
      preparation: {
        steps: [
          "5g matcha",
          "30 nước sôi hòa tan",
          "70ml sữa tươi",
          "10ml Rich lùn",
          "10, 20ml đường",
          "20ml sữa đặc",
          "200 Đá",
          "Đổ matcha lên trên",
          "Matcha kem muối thì thêm kem muối lên matcha latte"
          ],
        serving_tools: ["Ống hút to"],
        notes: "Dùng cốc size M hoặc cốc thủy tinh có quai"
      }
    },
    {
      id: "matcha_003",
      name: "Matcha latte",
      preparation: {
        steps: [
          "5g matcha",
          "30 nước sôi hòa tan",
          "70ml sữa tươi",
          "10ml Rich lùn",
          "10, 20ml đường",
          "20ml sữa đặc",
          "200 Đá",
          "Đổ matcha lên trên",
          "Matcha kem muối thì thêm kem muối lên matcha latte",
          ],
        serving_tools: ["Ống hút to"],
        notes: "Dùng cốc size M hoặc cốc thủy tinh có quai"
      }
    },
    {
      id: "matcha_004",
      name: "Matcha việt quất",
      preparation: {
        steps: [
          "30 mứt việt quất",
          "50 sữa tươi",
          "10ml rich",
          "10ml sữa đặc",
          "Đá",
          "1g matcha và 30 nước sôi",
          "Đổ lên"
        ],
        serving_tools: ["Ống hút to"],
        notes: " cốc thủy tinh có quai"
      }
    },
    {
      id: "matcha_005",
      name: "Matcha cốt dừa",
      preparation: {      
        steps: [
          "1g bột matcha",
          "20g cốt dừa",
          "30g nước sôi",
          "10ml sữa đặc",
          "50ml sữa tươi",
          "10ml Rich lùn",
        ],
        serving_tools: ["Ống hút nhỏ"],
        notes: "Cốc to nhẵn hoặc cốc ly rượu vang to"
      }
    },
    {
      id: "yogurt_001",
      name: "Sữa chua lắc đá",
      preparation: {
        steps: [
          "1 hộp sữa chua", 
          "10 rích 20 sữa đặc", 
          "20 sữa đặc", "50 sữa tươi", 
          "10 chanh hoặc tắc", 
          "Đá hoặc đến vạch 400ml", 
          "Deco ra cốc 1 lát chanh"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "yogurt_002",
      name: "Sữa chua việt quất",
      preparation: {
        steps: [
          "1 hộp sữa chua vào bình lắc", 
          "10 sữa đặc", 
          "50 sữa tươi", 
          "40 mứt việt quất", 
          "10 cốt tắc", 
          "150 đá hoặc đến vạch 400 trên bình lắc", 
          "Ly cốc loại 350ml", 
          "Deco: 2 kem trứng"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "yogurt_003",
      name: "Sữa chua đào",
      preparation: {
        steps: [
          "hộp sữa chua", 
          "40 mứt đào", 
          "10 sữa đặc", 
          "10 tắc", 
          "50 sữa tươi", 
          "150 đá hoặc đến vạch 400ml", 
          "Deco: 2 thìa kem trứng"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "yogurt_004",
      name: "Sữa chua cà phê",
      preparation: {
        steps: [
          "1 hộp sữa chua", 
          "10 rích", 
          "20 sữa đặc", 
          "30 sữa tươi", 
          "150 đá hoặc đến vạch 400ml", 
          "30 cafe đánh bông lên trên cốc sữa chua"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "yogurt_005",
      name: "Sữa chua trái cây nhiệt đới",
      preparation: {
        steps: [
          "1 hộp sữa chua", 
          "10 sữa đặc", 
          "40 sữa tươi", 
          "30 cốt quả ngâm", 
          "150 đá hoặc vạch 400ml", 
          "Ra cốc thêm 1 vợt quả lên trên"
        ],
        serving_tools: ["Ống hút to", "Thìa"]
      }
    },
    {
      id: "blended_001",
      name: "Oreo đá xay",
      preparation: {
        steps: [
          "3 bánh oreo", 
          "50 sữa đặc", 
          "50 sữa tươi", 
          "20 rích", 
          "10 socola", 
          "220 đá", 
          "Socola quanh cốc", 
          "Deco: (kem tươi) Vụn bánh, bột cacao"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "blended_002",
      name: "Café đá xay",
      preparation: {
        steps: [
          "50 cafe làm nguội", 
          "20 rích", 
          "30 sữa đặc", 
          "30 sữa tươi", 
          "30 nước đường", 
          "5g bột đá xay", 
          "180 đá giòn", 
          "Sốt socola quanh cốc", 
          "Deco: kem tươi, hạt cafe, bộ cacao"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "blended_003",
      name: "Vải đá xay",
      preparation: {
        steps: [
          "60gr quả vải ngâm",
          "20ml siro vải",
          "30ml nước vải ngâm",
          "20ml đường",
          "Đá",
          "Cho tất cả vào máy xay nhuyễn",
          "Décor: 1 quả vải"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "blended_004",
      name: "Matcha đá xay",
      preparation: {
        steps: [
          "40ml sữa tươi",
          "20ml sữa đặc",
          "10ml đường",
          "20ml Rich lùn",
          "20ml siro trà xanh",
          "6gr bột matcha",
          "10gr bột đá xay",
          "Đá",
          "Xay nhuyễn"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "blended_005",
      name: "Café cốt dừa",
      preparation: {
        steps: [
          "30 cafe vào ly đánh bông", 
          "20 bột cốt dừa", 
          "30 nước sôi hòa tan", 
          "50 sữa đặc", 
          "200 đá già to xay đều", 
          "Đổ lên trên cafe bông", 
          "Deco: dừa khô"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "blended_006",
      name: "Milo dầm",
      preparation: {
        steps: [
          "Cho đá xay đầy ly", 
          "30 sữa đặc", 
          "15 sữa tươi", 
          "5g cacao", 
          "20g milo", 
          "40 Trân châu"
        ],
        serving_tools: ["Ống hút to"],
        notes: "Dùng cốc size M hoặc cốc thủy tinh có quai"
      }
    },
    {
      id: "blended_007",
      name: "Chanh tuyết",
      preparation: {
        steps: [
          "Lấy 15ml nước cốt chanh",
          "Dùng ½ vỏ chanh",
          "40ml sữa đặc",
          "50ml đường",
          "1 cốc đá M đá to, già",
          "Xíu muối",
          "Xay nhuyễn hỗn hợp trên",
          "Décor: 1 lát chanh"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "fruit_tea_001",
      name: "Trà chanh nha đam",
      preparation: {
        steps: [
          "Rót 150ml cốt trà nhài",
          "Lấy 1 trái chanh cắt đôi và cắt 1 lát",
          "Vắt chanh lấy nước cốt 20ml",
          "Cho thêm 60ml đường nước (6 bơm)",
          "Xíu muối",
          "Cho thêm đá đến vạch 400ml lắc đều",
          "Lấy 1 vá nha đam đổ vào cốc sau đó cho hỗn hợp vừa lắc lên",
          "Décor: 1 lát chanh"
        ],
        serving_tools: ["Ống hút to"],
        notes: "Dùng cốc size M hoặc cốc thủy tinh có quai"
      }
    },
    {
      id: "fruit_tea_002",
      name: "Trà tắc nha đam",
      preparation: {
        steps: [
          "Rót 150ml cốt trà nhài",
          "Lấy 5 trái tắc (20ml)",
          "Vắt lấy nước cốt, giữ lại 3 vỏ tắc",
          "Cho thêm 60ml đường nước (6 bơm)",
          "Xíu muối",
          "Cho thêm đá đến vạch 400ml lắc đều",
          "Lấy 1 vá nha đam đổ vào cốc sau đó cho hỗn hợp vừa lắc lên",
          "Décor: 3 vỏ tắc"
        ],
        serving_tools: ["Ống hút to"],
        notes: "Dùng cốc size M hoặc cốc thủy tinh có quai"
      }
    },
    {
      id: "fruit_tea_003",
      name: "Trà trái cây nhiệt đới",
      preparation: {
        steps: [
          "Rót 150ml cốt trà nhài",
          "Vắt 3 trái tắc (10ml)",
          "Cho thêm 30ml đường nước (3 bơm)",
          "30ml nước cốt hoa quả ngâm",
          "Cho thêm đá đến vạch 400ml lắc đều",
          "Đổ ra cốc và múc 50gr trái cây hỗn hợp ngâm lên trên"
        ],
        serving_tools: ["Ống hút to", "Thìa"],
        notes: "Dùng cốc size M hoặc cốc thủy tinh có quai"
      }
    },
    {
      id: "fruit_tea_004",
      name: "Trà vải chanh dây",
      preparation: {
        steps: [
          "3 quả vải dầm nát", 
          "150 trà nhài", 
          "10 siro vải + muối", 
          "30 nước đường", 
          "10 chanh leo", 
          "200 đá và lắc", 
          "Deco: 3 quả vải"
        ],
        serving_tools: ["Ống hút to"],
        notes: "Dùng cốc size M hoặc cốc thủy tinh có quai"
      }
    },
    {
      id: "fruit_tea_005",
      name: "Trà đào cam sả",
      preparation: {
        steps: [
          "Rót 150ml cốt trà đào",
          "Vắt 3 trái tắc (10ml)",
          "Cho thêm 30ml đường nước (3 bơm)",
          "20ml siro sả",
          "30ml mứt đào",
          "Cho thêm đá đến vạch 400ml lắc đều",
          "Cắt 1 lát cam làm đôi, 1 nửa miếng cho xuống đáy cốc dằm nhuyễn, nửa miếng còn lại để trang trí lên trên",
          "Décor: 3 miếng đào ngâm, sả và cam",

          "150ml trà đào", 
          "20ml siro đường", 
          "20ml siro xả", 
          "30ml mứt đào", 
          "Cho đá vạch 400 vs lắc", 
          "Deco: 3 lát sả tươi, 3 lát quả đào", 
          "1 lát cam cắt đôi ½ dầm nát ½"
        ],
        serving_tools: ["Ống hút to", "Thìa"],
        notes: "Dùng cốc size M hoặc cốc thủy tinh có quai"
      }
    },
    {
      id: "fruit_tea_006",
      name: "Trà xoài chanh leo",
      preparation: {
        steps: [
          "3 miếng xoài vào dầm nát", 
          "150ml trà lài", 
          "40ml nước ngâm xoài", 
          "5ml tắc + xíu muối", 
          "20 nước đường", 
          "230 đá", 
          "Deco: 5 miếng xoài lên trên"
        ],
        serving_tools: ["Ống hút to"],
        notes: "Dùng cốc size M hoặc cốc thủy tinh có quai"
      }
    },
    {
      id: "fruit_tea_007",
      name: "Hồng trà cam xí muội",
      preparation: {
        steps: [
          "chưa có dữ liệu",
        ],
        serving_tools: ["Ống hút chưa có dữ liệu"],
        notes: "Dùng cốc chưa có dữ liệu"
      }
    },
        {
      id: "fruit_tea_008",
      name: "Trà vải",
      preparation: {
        steps: [
          "chưa có dữ liệu",
        ],
        serving_tools: ["Ống hút chưa có dữ liệu"],
        notes: "Dùng cốc chưa có dữ liệu"
      }
    },
        {
      id: "fruit_tea_009",
      name: "Trà nhãn",
      preparation: {
        steps: [
          "chưa có dữ liệu",
        ],
        serving_tools: ["Ống hút chưa có dữ liệu"],
        notes: "Dùng cốc chưa có dữ liệu"
      }
    },
    {
      id: "smoothie_001",
      name: "Sinh tố dâu tây",
      preparation: {
        steps: [
          "60gr dâu tây",
          "30ml sữa đặc",
          "20ml Rich lùn",
          "20ml nước đường",
          "30ml mứt Rasberry",
          "150ml nước lọc",
          "8gr bột kem béo",
          "Xíu muối",
          "½ cốc đá M"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "smoothie_002",
      name: "Sinh tố xoài",
      preparation: {
        steps: [
          "80gr xoài",
          "30ml sữa đặc",
          "20ml đường",
          "20ml Rich lùn",
          "150ml nước lọc",
          "Xíu muối",
          "8gr bột kem béo",
          "Đá"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "smoothie_003",
      name: "Sinh tố bơ",
      preparation: {
        steps: [
          "80g bơ", 
          "20 sữa đặc", 
          "30 đường", 
          "100 nước lọc", 
          "50-100 đá", 
          "3g bộ đá xay", 
          "1 xíu muối và xay", 
          "Deco: 3 lát bơ"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "smoothie_004",
      name: "Sinh tố bơ dừa",
      preparation: {
        steps: [
          "20g bột cốt dừa", 
          "30ml nước sôi hòa tan bột dừa", 
          "10 rích", 
          "80g bơ", 
          "30 sữa đặc", 
          "20 nước đường", 
          "10 rích", 
          "6g bột đá xay", 
          "70 nước lọc", 
          "80g đá", 
          "Ra cốc đổ cốt dừa lên trên", 
          "Deco: dừa vụn"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "smoothie_005",
      name: "Sinh tố bơ Sầu",
      preparation: {
        steps: [
          "80g bơ", 
          "20 sữa đặc", 
          "30 nước đường", 
          "70 nước lọc", 
          "80 đá", 
          "30g bột đá có hoặc không cũng được", 
          "1 viên kem sầu riêng rắc dừa vụn"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "hot_drinks_001",
      name: "Trà Thái Nguyên",
      preparation: {
        steps: [
          "Cho 10gr trà vào ấm",
          "Rót nước sôi, tráng trà, đổ nước đầu",
          "Rót đầy ấm và phục vụ kèm tách"
        ],
        serving_tools: ["Tách"]
      }
    },
    {
      id: "hot_drinks_002",
      name: "Trà gừng táo đỏ",
      preparation: {
        steps: [
          "1 gói trà gừng",
          "8gr táo đỏ",
          "3 lát gừng sắt sợi",
          "Ủ 2-3 phút",
          "Rót 30ml trà lài",
          "10ml mật ong và phục khách"
        ],
        serving_tools: ["Tách"]
      }
    },
    {
      id: "hot_drinks_003",
      name: "Trà hương cúc long nhãn",
      preparation: {
        steps: ["..."],
        serving_tools: ["Tách"]
      }
    },
    {
      id: "hot_drinks_004",
      name: "Trà hồng đào táo nhân lòng",
      preparation: {
        steps: ["..."],
        serving_tools: ["Tách"]
      }
    },
    {
      id: "hot_drinks_005",
      name: "Ca cao nóng",
      preparation: {
        steps: [
          "Cho vào cốc sứ hoặc cốc giấy",
          "10gr ca cao",
          "30ml nước sôi",
          "20ml sữa đặc",
          "10ml Rich",
          "Khuấy đều",
          "Lấy 120ml sữa tươi dùng vòi đánh sữa làm nóng sữa",
          "Rót vào cốc"
        ],
        serving_tools: ["Thìa"]
      }
    },
    {
      id: "ice_cream_001",
      name: "Kem 2 viên",
      preparation: {
        steps: [
          "Chọn 2 viên kem (Vani, Socola, Sầu riêng, Xoài, Dừa, Dâu)",
          "Trang trí xốt Socola, dừa khô và 2 bánh ống"
        ],
        serving_tools: ["Thìa"]
      }
    },
    {
      id: "ice_cream_002",
      name: "Kem 3 viên",
      preparation: {
        steps: [
          "Chọn 3 viên kem (Vani, Socola, Sầu riêng, Xoài, Dừa, Dâu)",
          "Trang trí xốt Socola, dừa khô và 2 bánh ống"
        ],
        serving_tools: ["Thìa"]
      }
    },
    {
      id: "juice_001",
      name: "Nước ép dứa",
      preparation: {
        steps: [
          "500gr dứa",
          "Xíu muối",
          "20ml đường"
        ],
        serving_tools: ["Ống hút"],
        notes: "Dùng bình lắc để ngon hơn"
      }
    },
    {
      id: "juice_002",
      name: "Nước ép chanh dây",
      preparation: {
        steps: [
          "Cho ra ca lắc: 150ml nước nóng, 1 túi chanh leo khuấy cho tan, xíu muối, 60ml đường, đá",
          "Lắc đều"
        ],
        serving_tools: ["Ống hút"],
        notes: "Dùng bình lắc để ngon hơn"
      }
    },
    {
      id: "juice_003",
      name: "Nước ép dưa hấu",
      preparation: {
        steps: [
          "500gr dưa hấu",
          "Xíu muối",
          "20ml đường",
          "Đá"
        ],
        serving_tools: ["Ống hút"],
        notes: "Dùng bình lắc để ngon hơn"
      }
    },
    {
      id: "juice_004",
      name: "Nước ép ổi",
      preparation: {
        steps: [
          "500gr ổi vào máy ép",
          "Xíu muối",
          "20ml đường"
        ],
        serving_tools: ["Ống hút"],
        notes: "Dùng bình lắc để ngon hơn"
      }
    },
    {
      id: "juice_005",
      name: "Nước ép táo",
      preparation: {
        steps: [
          "500gr táo (rửa sạch, bổ đôi, bỏ cuống và hạt)",
          "20ml đường"
        ],
        serving_tools: ["Ống hút"],
        notes: "Để táo không bị thâm, cho vào ca đựng ít đá, muối và vắt vài giọt chanh"
      }
    },
    {
      id: "juice_006",
      name: "Nước ép cam",
      preparation: {
        steps: [
          "500gr cam sành (2-3 quả)",
          "Xíu muối",
          "20ml đường",
          "Đá"
        ],
        serving_tools: ["Ống hút"],
        notes: "Dùng bình lắc để ngon hơn"
      }
    },
    {
      id: "juice_007",
      name: "Trái dừa",
      preparation: {
        steps: [
          "Chặt dừa ra",
          "Cắm ống hút"
        ],
        serving_tools: ["Ống hút"]
      }
    },
    {
      id: "juice_008",
      name: "Dĩa hoa quả",
      preparation: {
        steps: ["..."],
        serving_tools: ["Dĩa", "Nĩa"]
      }
    },
    {
      id: "juice_009",
      name: "Nước chanh",
      preparation: {
        steps: ["..."],
        serving_tools: ["...", "..."]
      }
    },
    {
      id: "snacks_001",
      name: "Hướng dương",
      preparation: {
        steps: ["Gói"],
        serving_tools: ["2 Dĩa"]
      }
    },
    {
      id: "snacks_002",
      name: "Bỏng ngô",
      preparation: {
        steps: ["Hộp"],
        serving_tools: ["Hộp"]
      }
    },
    {
      id: "snacks_003",
      name: "Khô bò",
      preparation: {
        steps: ["Gói"],
        serving_tools: ["Dĩa"]
      }
    },
    {
      id: "snacks_004",
      name: "Khô gà",
      preparation: {
        steps: ["Gói"],
        serving_tools: ["Dĩa"]
      }
    },
        {
      id: "snacks_005",
      name: "Hướng dương vị dừa",
      preparation: {
        steps: ["Gói"],
        serving_tools: ["2 Dĩa"]
      }
    },
        {
      id: "snacks_006",
      name: "Trâu gác bếp",
      preparation: {
        steps: ["Gói"],
        serving_tools: ["2 Dĩa"]
      }
    },
        {
      id: "snacks_007",
      name: "Ngô cay",
      preparation: {
        steps: ["Gói"],
        serving_tools: ["2 Dĩa"]
      }
    },
    {
      id: "special_drinks_001",
      name: "TRÀ TRÁI CÂY NHIỆT ĐỚI",
      preparation: {
        steps: [
          "Rót 150ml cốt trà nhài",
          "Vắt 3 trái tắc (10ml)",
          "Cho thêm 30ml đường nước (3 bơm)",
          "30ml nước cốt hoa quả ngâm",
          "Cho thêm đá đến vạch 400ml lắc đều",
          "Đổ ra cốc và múc 50gr trái cây hỗn hợp ngâm lên trên"
        ],
        serving_tools: ["Ống hút to", "Thìa"],
        notes: "Dùng cốc size M hoặc cốc thủy tinh có quai"
      }
    },
    {
      id: "special_drinks_002",
      name: "DỪA CỐT CÀ PHÊ",
      preparation: {
        steps: [
          "Cho 30ml cà phê ra cốc",
          "Xay hỗn hợp cốt dừa: 20gr bột cốt dừa, 30ml nước sôi, 50ml sữa đặc, 1 cốc đá M đá to, già",
          "Xay lên – đổ lên trên cà phê",
          "Décor: dừa khô"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "special_drinks_003",
      name: "CHANH TUYẾT",
      preparation: {
        steps: [
          "Lấy 15ml nước cốt chanh",
          "Dùng ½ vỏ chanh",
          "40ml sữa đặc",
          "50ml đường",
          "1 cốc đá M đá to, già",
          "Xíu muối",
          "Xay nhuyễn hỗn hợp trên",
          "Décor: 1 lát chanh"
        ],
        serving_tools: ["Ống hút to"]
      }
    },
    {
      id: "special_drinks_004",
      name: "CÀ PHÊ KEM Ý (affogato)",
      preparation: {
        steps: [
          "Lấy tay đôi, xay cà phê, nén",
          "Xả nước, lắp tay đôi vào máy",
          "Chiết xuất lấy 60ml cà phê",
          "Cho vào cốc đá, thêm 20ml sữa đặc, khuấy đều",
          "Thêm 1 viên kem vani (60gr) lên trên",
          "Rắc bột cacao"
        ],
        serving_tools: ["Thìa", "Ống hút"]
      }
    },
    {
      id: "special_drinks_005",
      name: "Không rõ",
      preparation: {
        steps: [
          "Khách yêu cầu",
        ],
        serving_tools: ["Khách yêu cầu"]
      }
    }
  ]
};

export default recipes;