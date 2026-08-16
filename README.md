# 🚀 Minecraft Resource Hub & Admin Gateway

Website chia sẻ Mod Fix Lag (Sodium, Iris, Optimization) và Bản vẽ máy farm Litematica độc quyền cho cộng đồng Minecraft.

---

## 🌟 Tính Năng Nổi Bật

1. **Giao Diện Dark Gaming Glassmorphism**:
   - Thiết kế hiện đại, mượt mà, tối ưu hiển thị trên cả Máy tính và Điện thoại di động.
   - Hiệu ứng ánh sáng huyền ảo, thẻ card phong cách game thủ chuyên nghiệp.
2. **Tìm Kiếm & Bộ Lọc Đa Tầng**:
   - 🔍 **Tìm kiếm tức thì (Instant Search)**: Tìm theo tên mod, tên máy farm, phiên bản `1.21.x`, năng suất, nguyên liệu...
   - ⚡ **Bộ lọc phiên bản**: Lọc theo phiên bản Minecraft (`1.21.x`, `1.20.x`, `1.19+`...).
   - 🏷️ **Quick Tag Chips**: Lọc nhanh theo loại farm (*Farm Đá*, *Farm Sắt*, *Farm Vàng*, *Farm Kelp*, *Sodium*...).
3. **Modal Xem Chi Tiết Bản Vẽ (Schematic Quick View)**:
   - Hiển thị đầy đủ thông số kỹ thuật: Năng suất (Yield), Kích thước (Dimensions), Độ khó, Danh sách nguyên liệu cần chuẩn bị và Lưu ý khi vận hành.
4. **Bảo Mật Quyền Quản Trị Tuyệt Đối**:
   - Khách xem web chỉ thấy giao diện tải và bấm vào link rút gọn kiếm tiền của bạn.
   - Trang quản trị riêng biệt tại đường dẫn `/admin` hoặc `/admin.html` được bảo vệ bằng mã bảo mật bí mật.

---

## 🔐 Hướng Dẫn Dành Cho Quản Trị Viên (Admin)

### 1. Truy cập trang Quản trị:
* Mở trình duyệt và truy cập đường link: `https://<tên-web-của-bạn>.vercel.app/admin` (hoặc mở file `admin.html`).
* Nhập mã bảo mật: `kietgottop2` để mở khóa bảng điều khiển.

### 2. Thêm / Sửa / Xóa tài nguyên:
* **Chọn thể loại 1-chạm**: Nhấn chọn nhanh `[⚡ Fix Lag (FPS)]` hoặc `[📦 Bản Vẽ Litematica]`.
* Điền tên, phiên bản, link ảnh minh họa và **Link rút gọn kiếm tiền** (`link4m`, `link1s`...).
* Nếu là bản vẽ máy farm Litematica, nhập các thông số năng suất, kích thước, nguyên liệu.
* Bấm **Lưu Dữ Liệu**.

### 3. Tự động đồng bộ lên GitHub & Vercel (Không cần tải file về):
* Chuyển sang tab **"Tự Động Đẩy Lên Web"** trong trang Admin.
* Dán **GitHub Personal Access Token** vào ô cấu hình và bấm **Lưu**.
* Bấm nút **"🚀 Đẩy Toàn Bộ Dữ Liệu Lên GitHub Ngay"** -> Dữ liệu sẽ tự động commit thẳng vào repo `shopwarlergen/mc`, Vercel sẽ tự động cập nhật web trong vòng 10–20 giây!
