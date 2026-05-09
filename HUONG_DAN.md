# Hướng Dẫn Sử Dụng Web Demo Huffman Cơ Bản

Đây là một trang web demo thuật toán Huffman (Mã hóa và Giải mã) được thiết kế tối giản, trực quan và đặc biệt là chạy **100% trên một file duy nhất (`index.html`)** mà không cần cài đặt các framework phức tạp như Django hay Node.js.

## 1. Cách chạy trang web

Cách đơn giản nhất là bạn chỉ cần **click đúp chuột vào file `index.html`** để mở nó trực tiếp trên trình duyệt Chrome, Edge, Cốc Cốc hoặc Safari.

Nếu bạn muốn chạy nó dưới dạng một local server (máy chủ ảo chuyên nghiệp hơn), bạn có thể mở **Command Prompt (hoặc Terminal)**, trỏ vào thư mục chứa file `index.html` (thư mục `seminar`) và gõ lệnh sau:

```bash
# Đối với máy cài sẵn Python 3
python -m http.server 8000
```
Sau đó mở trình duyệt và truy cập vào đường dẫn: `http://localhost:8000`

## 2. Cấu trúc Code bên trong `index.html`
Toàn bộ mã nguồn nằm gọn trong file `index.html`. File này sử dụng 3 thư viện chính qua đường dẫn CDN (tải trực tiếp từ internet):
1. **ReactJS**: Quản lý trạng thái và giao diện.
2. **TailwindCSS**: Thư viện hỗ trợ viết CSS siêu nhanh (các class như `bg-white`, `text-slate-800`...).
3. **Babel**: Một trình biên dịch chạy ngay trên trình duyệt để dịch mã React (JSX) thành Javascript thuần để trình duyệt hiểu được.

## 3. Cách sửa đổi code
Nếu bạn muốn sửa lỗi hoặc đổi màu sắc:
1. Bạn hãy mở file `index.html` bằng bất kỳ Editor nào (như **VS Code**, **Notepad++**, hay **Sublime Text**).
2. Code đã được chia làm 3 khu vực có chú thích rõ ràng:
   - **`// --- CÁC ICON DÙNG CHUNG ---`**: Chứa các icon Nút Play, Pause.
   - **`// ==========================================`**
     **`// COMPONENT MÃ HÓA (HUFFMAN BUILDER)`**
     **`// ==========================================`**: Toàn bộ thuật toán mã hóa tính tần suất chữ và vẽ ra cây.
   - **`// ==========================================`**
     **`// COMPONENT GIẢI MÃ (HUFFMAN ANIMATION)`**
     **`// ==========================================`**: Toàn bộ logic chạy dọc theo cây nhị phân để in ra chuỗi giải mã.
3. Chỉnh sửa tùy thích, sau đó ra ngoài trình duyệt nhấn F5 (Tải lại trang) là xem được sự thay đổi ngay lập tức.
