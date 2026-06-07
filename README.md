# Demo nén dữ liệu — Huffman & LZ77

Seminar Phân tích & thiết kế thuật toán: hai thuật toán nén dữ liệu **Huffman Coding** và **LZ77**, kèm trang web demo minh họa từng bước và hệ thống kiểm thử tự động.

## Cấu trúc dự án

| File | Mô tả |
|------|-------|
| `huffman.py` | Thuật toán Huffman (`HuffmanCoder`): mã hóa + giải mã, dựng cây, sinh bảng mã. |
| `lz77.py` | Thuật toán LZ77 (`LZ77Coder`): mã hóa cửa sổ trượt + giải mã. |
| `demo.html` | Trang web tương tác minh họa: sinh cây Huffman từng bước, cửa sổ trượt LZ77, giải mã chuỗi bit/danh sách token và so sánh tỉ lệ nén. |
| `test_visualize.py` | Kịch bản kiểm thử tự động: chạy encode/decode trên các test case và sinh báo cáo HTML. |
| `visualize_report.html`| Báo cáo kiểm thử sinh tự động — biểu đồ thống kê và bảng chi tiết. |
| `huffman_encode_testcase.csv` | **30 test case** mã hóa Huffman (chuỗi đầu vào + kết quả kỳ vọng). |
| `lz77_encode_test_case.csv` | **30 test case** mã hóa LZ77 (chuỗi đầu vào + kết quả kỳ vọng). |

## Cách chạy và Kiểm thử

### 1. Trang web minh hoạ thuật toán

Mở file `demo.html` bằng trình duyệt web bất kỳ. Trang web cho phép:
- Mã hoá văn bản và xem Animation từng bước.
- Cung cấp tính năng **Giải mã** tuỳ chỉnh (nhập chuỗi bits/token và bảng mã).

### 2. Sinh báo cáo kiểm thử tự động

Chạy lệnh sau để thực thi toàn bộ 120 test case và tạo báo cáo `visualize_report.html`:

```bash
python test_visualize.py
```

> **Lưu ý cho Windows:** Nếu bị lỗi phông chữ khi in ra console, chạy với:
> ```bash
> set PYTHONIOENCODING=utf-8 && python test_visualize.py
> ```
> Hoặc trong PowerShell:
> ```powershell
> $env:PYTHONIOENCODING='utf-8'; python test_visualize.py
> ```

## Mô tả chi tiết quy trình kiểm thử

### Quy trình tổng quan

Hệ thống kiểm thử tự động chia thành **4 phần**, tạo thành **120 test case** (30 × 4):

```
┌──────────────────────────────────────────────────────────────┐
│              QUY TRÌNH KIỂM THỬ TỔNG QUAN                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ENCODE (từ file CSV)              DECODE (round-trip)       │
│  ┌──────────────────┐              ┌──────────────────┐      │
│  │ 1. Huffman Encode│──output──────▶│ 3. Huffman Decode│      │
│  │    (30 tests)    │              │    (30 tests)    │      │
│  └──────────────────┘              └──────────────────┘      │
│  ┌──────────────────┐              ┌──────────────────┐      │
│  │ 2. LZ77 Encode   │──output──────▶│ 4. LZ77 Decode   │      │
│  │    (30 tests)    │              │    (30 tests)    │      │
│  └──────────────────┘              └──────────────────┘      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Phần 1 & 2 — Encode (kiểm thử từ file CSV)

| Thuật toán | File CSV nguồn | Số test case |
|------------|----------------|:------------:|
| Huffman | `huffman_encode_testcase.csv` | 30 |
| LZ77 | `lz77_encode_test_case.csv` | 30 |

**Quy trình:**
1. Đọc từng dòng CSV: cột `Input` = chuỗi gốc, cột `Output` = kết quả mã hóa kỳ vọng.
2. Chạy thuật toán `encode()` trên chuỗi `Input`.
3. So sánh output thực tế với `Output` kỳ vọng → **PASS** nếu khớp, **FAIL** nếu khác.
4. Ghi nhận thời gian thực thi (ms).

**Định dạng output Huffman Encode** (trong CSV):
```
<số_ký_tự_bảng_mã>
<ký_tự_1> <mã_bit_1>
<ký_tự_2> <mã_bit_2>
...
<chuỗi_bit_đã_mã_hóa>
```

**Định dạng output LZ77 Encode** (trong CSV):
```
<số_token>
<offset_1> <length_1> <next_char_1>
<offset_2> <length_2> <next_char_2>
...
```

### Phần 3 & 4 — Decode (kiểm thử round-trip)

**Không sử dụng file CSV riêng** cho bước decode. Thay vào đó:

1. Lấy **output thực tế** của bước Encode làm input cho Decode.
2. Chạy thuật toán `decode()` để giải mã ngược.
3. So sánh kết quả giải mã với **chuỗi gốc ban đầu** → **PASS** nếu khớp.

**Lý do dùng round-trip:**
- Kiểm tra tính **lossless** (không mất mát) của thuật toán: `decode(encode(text)) == text`.
- Đảm bảo bộ encode và decode hoạt động **đồng bộ** với nhau.
- Mỗi test case encode tự động sinh ra 1 test case decode tương ứng.

### Bảng tóm tắt test case

| # | Tab trong báo cáo | Nguồn dữ liệu | Input | Expected Output | Số test |
|---|-------------------|---------------|-------|-----------------|:-------:|
| 1 | Huffman Encode | `huffman_encode_testcase.csv` | Chuỗi gốc từ CSV | Output từ CSV | 30 |
| 2 | LZ77 Encode | `lz77_encode_test_case.csv` | Chuỗi gốc từ CSV | Output từ CSV | 30 |
| 3 | Huffman Decode | Round-trip từ #1 | Output encode #1 | Chuỗi gốc #1 | 30 |
| 4 | LZ77 Decode | Round-trip từ #2 | Output encode #2 | Chuỗi gốc #2 | 30 |

### Các test case tiêu biểu

| Input | Mục đích kiểm thử |
|-------|-------------------|
| `A` | Chuỗi 1 ký tự (trường hợp biên) |
| `AAAAAA` | Chuỗi lặp 1 ký tự duy nhất |
| `AB`, `ABAB` | Chuỗi 2 ký tự, cân bằng tần suất |
| `HELLO`, `hello`, `Hello` | Phân biệt chữ hoa/thường |
| `12345` | Ký tự số |
| `!@#$` | Ký tự đặc biệt |
| `BANANA`, `MISSISSIPPI` | Chuỗi có ký tự lặp không đều |
| `ABABCBABABCAD` | Chuỗi có pattern lặp (tối ưu LZ77) |
| `++++++++++`, `::::::::::::::::` | Chuỗi toàn ký tự giống nhau |
| `ABCDEFGHIJKLMNOPQRSTUVWXYZ` | Toàn bộ bảng chữ cái (26 ký tự khác nhau) |
| `TheQuickBrownFox` | Chuỗi thực tế, không khoảng trắng |

## Tính đúng đắn của Thuật toán

Cả hai file `huffman.py` và `lz77.py` đã được xác minh **chính xác 100% về mặt logic nén không mất mát (Lossless)**:
- Vượt qua toàn bộ **120 test case** (30 encode + 30 decode cho mỗi thuật toán).
- **Round-trip test** xác nhận: `decode(encode(text)) == text` cho mọi đầu vào.
- **Huffman:** Mã sinh ra thỏa mãn tính prefix-free (không mã nào là tiền tố của mã khác).
- **LZ77:** Được code bám sát lý thuyết nguyên thủy (Lempel-Ziv 1977), xuất ra các bộ ba `(offset, length, next_char)`. Logic JS trong `demo.html` khớp 100% với bản Python.
