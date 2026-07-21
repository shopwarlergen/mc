/* =========================================================
   DATA.JS - Nơi chứa danh sách các File Fix Lag & Litematica
   ---------------------------------------------------------
   Ghi chú cho người quản lý dữ liệu:
   - Muốn thêm file mới, chỉ cần copy 1 khối {} bên dưới và điền thông tin.
   - Trường "image": Nếu có ảnh minh họa thì điền link ảnh (VD: "https://i.imgur.com/abc.jpg").
                    Nếu KHÔNG CÓ ảnh, để trống "" hoặc null, trang web sẽ tự dùng icon đẹp mắt.
   - Trường "link": Điền LINK RÚT GỌN của bạn vào đây. Bấm nút sẽ mở link này ngay tại trang hiện tại.
   ========================================================= */

const resourceData = [
    // ==========================================
    // MỤC 1: FIX LAG (Cấu hình / Mod / Optimization)
    // ==========================================
    {
        id: "fixlag-01",
        category: "fixlag",
        title: "Bản Fix Lag Sodium + Lithium 1.20.1",
        description: "Tối ưu hóa FPS cực đỉnh cho máy cấu hình yếu. Tăng từ 30 FPS lên 120+ FPS mượt mà.",
        version: "1.20.1",
        size: "15 MB",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop", // Link ảnh ví dụ (có thể để "" nếu không có)
        link: "https://link-rut-gon-cua-ban.com/fixlag1" // Thay bằng link rút gọn của bạn
    },
    {
        id: "fixlag-02",
        category: "fixlag",
        title: "File Option Tắt Hiệu Ứng Nặng (No Lag)",
        description: "Tắt toàn bộ hạt hạt bong bóng, khói, hoạt ảnh nước chảy giúp giảm tối đa RAM tiêu thụ.",
        version: "All Version",
        size: "2 MB",
        image: "", // Không có ảnh -> Hệ thống tự động tạo icon
        link: "https://link-rut-gon-cua-ban.com/nolag-option"
    },
    {
        id: "fixlag-03",
        category: "fixlag",
        title: "Pack Config Tối Ưu RAM 4GB",
        description: "Bộ cài đặt chuẩn dành riêng cho các bạn chơi Minecraft trên PC/Laptop RAM 4GB không sợ dis game.",
        version: "1.16.5 - 1.20.4",
        size: "8 MB",
        image: "",
        link: "https://link-rut-gon-cua-ban.com/config-4gb"
    },

    // ==========================================
    // MỤC 2: LITEMATICA (File Schematic Công Trình)
    // ==========================================
    {
        id: "lite-01",
        category: "litematica",
        title: "Trang Trại Sắt (Iron Farm) 1000/h",
        description: "Bản vẽ Litematica trang trại sắt siêu nhỏ gọn, dễ xây cho sinh tồn giai đoạn đầu.",
        version: "1.20+",
        size: "120 KB",
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop", // Link ảnh mẫu
        link: "https://link-rut-gon-cua-ban.com/iron-farm"
    },
    {
        id: "lite-02",
        category: "litematica",
        title: "Lâu Đài Đỏ Kiểu Hiện Đại (Modern Castle)",
        description: "Bản vẽ công trình lâu đài chi tiết đầy đủ nội thất, phù hợp làm căn cứ chính.",
        version: "1.19+",
        size: "1.5 MB",
        image: "", // Không có ảnh -> Tự động hiện icon Litematica đẹp
        link: "https://link-rut-gon-cua-ban.com/modern-castle"
    },
    {
        id: "lite-03",
        category: "litematica",
        title: "Trang Trại Vàng & XP Siêu Tốc (Gold Farm)",
        description: "Bản vẽ trang trại vàng trên nóc Nether, cày XP từ level 0 lên 100 chỉ trong 5 phút.",
        version: "1.20.1",
        size: "450 KB",
        image: "",
        link: "https://link-rut-gon-cua-ban.com/gold-farm"
    }
];
