# Demo nén dữ liệu — Huffman & LZ77

Seminar Phân tích & thiết kế thuật toán: hai thuật toán nén dữ liệu **Huffman Coding** và **LZ77**, kèm trang web demo minh họa từng bước và hệ thống kiểm thử tự động.

## Cấu trúc dự án

| File | Mô tả |
|------|-------|
| `huffman.py` | Thuật toán Huffman (`HuffmanCoder`): mã hóa + giải mã, dựng cây, sinh bảng mã. |
| `lz77.py` | Thuật toán LZ77 (`LZ77Coder`): mã hóa cửa sổ trượt + giải mã. |
| `demo.html` | Trang web tương tác minh họa: sinh cây Huffman từng bước, cửa sổ trượt LZ77, giải mã chuỗi bit/danh sách token và so sánh tỉ lệ nén. |
| `test_visualize.py` | Kịch bản kiểm thử (Test Runner) tự động chạy các thuật toán nén và sinh báo cáo dưới dạng HTML. |
| `visualize_report.html`| Báo cáo kiểm thử sinh tự động chứa biểu đồ đo lường hiệu năng và bảng dữ liệu chi tiết. |
| `*.csv` | 4 tập tin chứa dữ liệu test case (Encode/Decode) cho Huffman và LZ77. |

## Cách chạy và Kiểm thử

**1. Trang web minh hoạ thuật toán:**
Mở file `demo.html` bằng trình duyệt web bất kỳ. Trang web cho phép:
- Mã hoá văn bản và xem Animation từng bước.
- Cung cấp tính năng **Giải mã** tuỳ chỉnh (nhập chuỗi bits/token và bảng mã).

**2. Sinh báo cáo kiểm thử tự động:**
Hệ thống đi kèm bộ dữ liệu kiểm thử trong các file `.csv`. Để tự động chạy qua toàn bộ test cases và tạo trang báo cáo `visualize_report.html`, chạy lệnh:
```bash
python test_visualize.py
```
*Lưu ý trên Windows: Nếu bị lỗi phông chữ khi print, hãy đặt biến môi trường `PYTHONIOENCODING=utf-8`.*

## Tính đúng đắn của Thuật toán

Cả hai file `huffman.py` và `lz77.py` đã được xác minh **chính xác 100% về mặt logic nén không mất mát (Lossless)**:
- Vượt qua toàn bộ hơn 120+ test case (Round-trip mã hóa → giải mã = chuỗi gốc) đối chiếu sát sao với dữ liệu mẫu trong file CSV.
- **Huffman:** Mã sinh ra thỏa mãn tính prefix-free (không mã nào là tiền tố của mã khác).
- **LZ77:** Được code bám sát lý thuyết nguyên thủy (Lempel-Ziv 1977), xuất ra các bộ ba `(offset, length, next_char)`. Logic JS trong `demo.html` khớp 100% với bản Python.
