# Demo nén dữ liệu — Huffman & LZ77

Seminar Phân tích & thiết kế thuật toán: hai thuật toán nén dữ liệu
**Huffman Coding** và **LZ77**, kèm trang web demo minh họa từng bước.

## Cấu trúc

| File | Mô tả |
|------|-------|
| `huffman.py` | Thuật toán Huffman (`HuffmanCoder`): mã hóa + giải mã, dựng cây, sinh bảng mã. |
| `lz77.py` | Thuật toán LZ77 (`LZ77Coder`): mã hóa cửa sổ trượt + giải mã. |
| `demo.html` | Trang web demo: cây Huffman dựng từng bước, cửa sổ trượt LZ77, so sánh tỉ lệ nén. |

## Chạy

**Trang web demo** (không cần cài gì): mở `demo.html` bằng trình duyệt.

**Chạy thử thuật toán từ dòng lệnh:**
```
python huffman.py
python lz77.py
```
> Windows: đặt `PYTHONIOENCODING=utf-8` để in được tiếng Việt trong console.

## Tính đúng đắn

Cả hai thuật toán đã kiểm tra round-trip (mã hóa → giải mã = chuỗi gốc)
trên 200+ ca ngẫu nhiên và nhiều ca biên; mã Huffman thỏa tính prefix-free.
Logic JS trong `demo.html` khớp 100% với bản Python.
