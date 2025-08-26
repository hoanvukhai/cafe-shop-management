# Cafe Shop Management System

## Giới thiệu

Dự án **Cafe Shop Management** là một ứng dụng web được xây dựng để hỗ trợ quản lý quán cà phê. Ứng dụng giúp quản lý các hoạt động hàng ngày như quản lý menu, đơn hàng, công thức pha chế, nhiệm vụ nhân viên, bảng chấm công, và các thống kê dành cho quản lý. Dự án được phát triển bằng React.js, sử dụng Firebase làm backend để lưu trữ dữ liệu, và tập trung vào các vai trò người dùng khác nhau như Admin (Quản trị viên), Bartender (Nhân viên pha chế), Manager (Quản lý), và các nhân viên khác.

Dựa trên cấu trúc mã nguồn, ứng dụng này cung cấp giao diện thân thiện để theo dõi doanh thu, thời gian cao điểm, chỉnh sửa menu, quản lý đơn hàng, và hỗ trợ chuẩn bị đồ uống. Đây là hệ thống dành riêng cho quán cà phê, không liên quan đến các dự án khác như quản lý cửa hàng chung chung.

## Công nghệ sử dụng

- **Frontend**: React.js (kết hợp TypeScript để đảm bảo an toàn kiểu dữ liệu).
- **UI**: Tailwind CSS (tăng tốc phát triển, hỗ trợ responsive) + CSS tùy chỉnh (`App.css`, `index.css`).
- **Icons**: React Icons (cung cấp bộ icon phong phú, dễ tích hợp).
- **Backend/Database**: Firebase (xử lý xác thực và lưu trữ dữ liệu thời gian thực).
- **Khác**: React Router để quản lý route, các thành phần UI tái sử dụng, quản lý package qua `package.json`.

## Cấu trúc dự án

Dự án được tổ chức theo cấu trúc chuẩn của ứng dụng React, với thư mục `src` chứa mã nguồn chính. Dưới đây là phân tích chi tiết dựa trên các file và thư mục:

### Thư mục `src/components`
Chứa các thành phần tái sử dụng (components) cho giao diện. Các components được phân loại theo vai trò hoặc chức năng.

- **Admin**: Các tab dành riêng cho quản trị viên.
  - `BestSellerTab.tsx`: Tab hiển thị sản phẩm bán chạy nhất (best sellers) trong quán cà phê, có thể bao gồm thống kê số lượng bán và doanh thu.
  - `MenuEditTab.tsx`: Tab chỉnh sửa menu, cho phép thêm/sửa/xóa các món đồ uống hoặc đồ ăn.
  - `MenuStatsTab.tsx`: Tab thống kê về menu, như số lượng món, lượt order, hoặc đánh giá.
  - `PeakTimeTab.tsx`: Tab phân tích thời gian cao điểm (peak time), giúp tối ưu hóa lịch làm việc.
  - `RevenueTab.tsx`: Tab hiển thị doanh thu, có thể theo ngày/tuần/tháng.
  - `TasksTab.tsx`: Tab quản lý nhiệm vụ cho nhân viên.
  - `Timesheet.tsx`: Component quản lý bảng chấm công (timesheet) cho nhân viên.
  - `WorkingHoursTab.tsx`: Tab theo dõi giờ làm việc của nhân viên.

- **bartender**: Các components dành cho nhân viên pha chế.
  - `BartenderOrderCard.tsx`: Card hiển thị đơn hàng dành cho bartender, có thể bao gồm chi tiết đồ uống cần pha chế.
  - `RecipeModal.tsx`: Modal hiển thị công thức pha chế (recipe) cho một món đồ.

- **order**: Components liên quan đến đơn hàng.
  - `Order.tsx`: Component chính để hiển thị và quản lý đơn hàng.

- `Header.tsx`: Header chung cho ứng dụng, có thể chứa logo, navigation bar, và thông tin người dùng.
- `ProtectedRoute.tsx`: Component bảo vệ route, đảm bảo chỉ người dùng đã đăng nhập hoặc có quyền mới truy cập các trang nhất định (sử dụng Firebase Auth).

### Thư mục `src/data`
Chứa các file dữ liệu tĩnh hoặc mock data để phát triển.

- `menu_items.ts`: Danh sách các món trong menu (ví dụ: cà phê sữa, trà xanh, bánh mì).
- `preparation_instructions.ts`: Hướng dẫn chuẩn bị đồ uống hoặc đồ ăn.
- `recipes.ts`: Công thức pha chế chi tiết cho từng món.
- `tables.ts`: Dữ liệu về bàn ghế trong quán (ví dụ: số bàn, vị trí).
- `tasks.ts`: Danh sách nhiệm vụ mặc định cho nhân viên.
- `users.ts`: Dữ liệu người dùng mẫu (vai trò, thông tin nhân viên).

### Thư mục `src/pages`
Chứa các trang chính (pages) của ứng dụng, mỗi file đại diện cho một route.

- `AdminPage.tsx`: Trang chính cho Admin, tích hợp các tab từ components/Admin.
- `BartenderPage.tsx`: Trang dành cho Bartender, hiển thị đơn hàng đang chờ pha chế.
- `DailyTasksPage.tsx`: Trang quản lý nhiệm vụ hàng ngày.
- `LoginPage.tsx`: Trang đăng nhập, sử dụng Firebase Auth.
- `ManagerPage.tsx`: Trang cho Manager, có thể quản lý nhân viên và đơn hàng.
- `OrderPage.tsx`: Trang quản lý đơn hàng tổng thể.
- `PreparationPage.tsx`: Trang hướng dẫn chuẩn bị (preparation) cho bartender hoặc nhân viên.
- `RecipesPage.tsx`: Trang hiển thị và quản lý công thức pha chế.
- `TimesheetPage.tsx`: Trang bảng chấm công.

### Các file khác trong `src`
- `App.css`: File CSS cho toàn bộ ứng dụng.
- `App.test.tsx`: File test cho App component (sử dụng Jest hoặc React Testing Library).
- `App.tsx`: File chính khởi tạo ứng dụng, bao gồm router và providers (như Firebase context).
- `firebase.ts`: File cấu hình và kết nối với Firebase (Auth, Firestore, Realtime Database).
- `index.css`: CSS global cho ứng dụng.
- `index.tsx`: Entry point, render App vào DOM.
- `logo.svg`: Logo của ứng dụng (có thể là logo quán cà phê).

## Chức năng chính

Dựa trên cấu trúc file, các chức năng chính của hệ thống bao gồm:

1. **Quản lý Menu**: Chỉnh sửa, thống kê, và hiển thị menu (MenuEditTab, MenuStatsTab).
2. **Quản lý Đơn Hàng**: Tạo, xem, và xử lý đơn hàng (Order.tsx, OrderPage.tsx, BartenderOrderCard.tsx).
3. **Công Thức Pha Chế**: Hiển thị và quản lý recipes (RecipeModal.tsx, RecipesPage.tsx).
4. **Nhiệm Vụ và Bảng Chấm Công**: Giao nhiệm vụ, theo dõi giờ làm (TasksTab.tsx, Timesheet.tsx, DailyTasksPage.tsx).
5. **Thống Kê và Báo Cáo**: Doanh thu, sản phẩm bán chạy, thời gian cao điểm (RevenueTab.tsx, BestSellerTab.tsx, PeakTimeTab.tsx).
6. **Quản Lý Người Dùng**: Vai trò khác nhau (Admin, Manager, Bartender), với bảo mật route (ProtectedRoute.tsx).
7. **Chuẩn Bị Đồ Uống**: Hướng dẫn preparation (PreparationPage.tsx, preparation_instructions.ts).
8. **Đăng Nhập và Xác Thực**: Sử dụng Firebase cho login (LoginPage.tsx).

Ứng dụng tập trung vào quy trình làm việc của quán cà phê, từ order đến pha chế và báo cáo.

## Hướng dẫn cài đặt và chạy

1. **Yêu cầu**: Node.js (phiên bản 14+), Yarn hoặc NPM.
2. **Clone repository**:
   ```
   git clone https://github.com/hoanvukhai/cafe-shop-management.git
   cd cafe-shop-management
   ```
3. **Cài đặt dependencies**:
   ```
   npm install
   ```
   (Hoặc `yarn install` nếu sử dụng Yarn).
4. **Cấu hình Firebase**: Tạo dự án Firebase trên console.firebase.google.com, sau đó thêm config vào `src/firebase.ts`.
5. **Chạy ứng dụng**:
   ```
   npm start
   ```
   Ứng dụng sẽ chạy tại `http://localhost:3000`.
6. **Build production**:
   ```
   npm run build
   firebase deploy
   ```

## Góp ý và cải tiến
Do dự án được phát triển trong thời gian gấp rút nên vẫn còn nhiều hạn chế. 
Trong tương lai, hệ thống có thể được cải thiện ở các điểm sau:

1. **Tối ưu codebase**: Giảm trùng lặp logic bằng cách sử dụng hooks hoặc context.
2. **Quản lý state**: Tích hợp thư viện như Zustand hoặc Redux Toolkit thay cho state cục bộ.
3. **UI/UX**: Bổ sung loading state, thông báo lỗi/thành công, dark mode, và cải thiện trải nghiệm người dùng.
4. **Phân quyền chi tiết**: Mở rộng phân quyền theo vai trò (Admin, Manager, Bartender, Nhân viên).
5. **Hiệu suất & Bảo mật**:
   - Thêm caching để giảm tải Firebase.
   - Xây dựng Firebase Rules chặt chẽ hơn để bảo vệ dữ liệu.
6. **Mở rộng tính năng**:
   - Xuất báo cáo dưới dạng Excel/PDF.
   - Tích hợp thanh toán QR/online.
   - Dashboard trực quan hơn với biểu đồ.
   - Thêm các tính năng khác.

