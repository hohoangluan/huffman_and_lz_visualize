"""
test_visualize.py — Kịch bản kiểm thử tự động cho Huffman và LZ77.

Quy trình kiểm thử:
  1. ENCODE:
     - Đọc test case từ file CSV (huffman_encode_testcase.csv, lz77_encode_test_case.csv).
     - Mỗi dòng CSV gồm: Input (chuỗi gốc) và Output (kết quả mã hóa kỳ vọng).
     - Chạy thuật toán encode, so sánh kết quả thực tế với kết quả kỳ vọng.

  2. DECODE (Round-trip — Mã hóa → Giải mã):
     - KHÔNG dùng file CSV riêng cho decode.
     - Lấy output thực tế của bước encode làm input cho bước decode.
     - Chạy thuật toán decode, kiểm tra xem kết quả giải mã có khớp chuỗi gốc hay không.
     - Đây là kiểm thử "round-trip": encode(text) → decode(...) == text.

  3. Kết quả được xuất thành file HTML (visualize_report.html) với 4 tab:
     - Huffman Encode, LZ77 Encode, Huffman Decode, LZ77 Decode.

Cách chạy:
    python test_visualize.py
"""

import csv
import json
import time
from huffman import HuffmanCoder
from lz77 import LZ77Coder


# ===========================================================================
# HÀM ĐỊNH DẠNG KẾT QUẢ ENCODE → CHUỖI NHIỀU DÒNG (KHỚP ĐỊNH DẠNG CSV)
# ===========================================================================

def format_huffman_encode(res):
    """Định dạng kết quả mã hóa Huffman thành chuỗi nhiều dòng.

    Dòng 1: số lượng ký tự trong bảng mã.
    Các dòng tiếp: mỗi dòng là "ký_tự mã_bit", sắp xếp theo ký tự.
    Dòng cuối: chuỗi bit đã mã hóa.

    Ví dụ với input "AABB":
        2
        A 0
        B 1
        0011
    """
    lines = [str(len(res.codes))]
    for ch, code in sorted(res.codes.items()):
        lines.append(f"{ch} {code}")
    lines.append(res.encoded)
    return "\n".join(lines)


def format_lz77_encode(res):
    """Định dạng kết quả mã hóa LZ77 thành chuỗi nhiều dòng.

    Dòng 1: số lượng token.
    Các dòng tiếp: mỗi dòng là "offset length next_char".

    Ví dụ với input "AABB":
        3
        0 0 A
        1 1 B
        0 0 B
    """
    lines = [str(len(res.tokens))]
    for t in res.tokens:
        lines.append(f"{t.offset} {t.length} {t.next_char}")
    return "\n".join(lines)


# ===========================================================================
# HÀM PHÂN TÍCH (PARSE) INPUT CHO BƯỚC DECODE
# ===========================================================================

def parse_huffman_decode_input(inp):
    """Phân tích chuỗi nhiều dòng (output của encode) → bảng mã + chuỗi bit.

    Đầu vào: chuỗi nhiều dòng (giống format_huffman_encode).
    Đầu ra:  (codes: dict[str, str], encoded: str)
        - codes: bảng mã {ký_tự: chuỗi_bit}
        - encoded: chuỗi bit đã mã hóa
    """
    lines = inp.replace("\r", "").split("\n")
    num_codes = int(lines[0])           # dòng đầu = số ký tự trong bảng mã
    codes = {}
    for i in range(1, num_codes + 1):   # các dòng tiếp theo = bảng mã
        line = lines[i]
        parts = line.rsplit(' ', 1)     # rsplit để xử lý ký tự có dấu cách
        ch = parts[0]
        code = parts[1]
        codes[ch] = code
    encoded = lines[num_codes + 1]      # dòng cuối = chuỗi bit
    return codes, encoded


def parse_lz77_decode_input(inp):
    """Phân tích chuỗi nhiều dòng (output của encode) → danh sách Token.

    Đầu vào: chuỗi nhiều dòng (giống format_lz77_encode).
    Đầu ra:  list[Token]
    """
    from lz77 import Token
    lines = inp.replace("\r", "").split("\n")
    num_tokens = int(lines[0])          # dòng đầu = số token
    tokens = []
    for i in range(1, num_tokens + 1):  # các dòng tiếp theo = từng token
        line = lines[i]
        parts = line.split(' ', 2)
        offset = int(parts[0])
        length = int(parts[1])
        next_char = parts[2] if len(parts) > 2 else ""
        tokens.append(Token(offset, length, next_char))
    return tokens


# ===========================================================================
# HÀM CHÍNH — CHẠY TOÀN BỘ KIỂM THỬ VÀ SINH BÁO CÁO HTML
# ===========================================================================

def main():
    # Danh sách kết quả cho 4 phần kiểm thử
    h_enc_results = []   # Huffman Encode
    lz_enc_results = []  # LZ77 Encode
    h_dec_results = []   # Huffman Decode (round-trip)
    lz_dec_results = []  # LZ77 Decode (round-trip)

    # ===================================================================
    # PHẦN 1: HUFFMAN ENCODE
    # Đọc test case từ file huffman_encode_testcase.csv
    # Mỗi dòng: Input (chuỗi gốc), Output (kết quả mã hóa kỳ vọng)
    # ===================================================================
    try:
        with open('huffman_encode_testcase.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)                # bỏ qua dòng header "Input,Output"
            for row in reader:
                if not row:
                    continue
                inp = row[0]            # chuỗi cần mã hóa
                expected = row[1].replace("\r", "")  # output kỳ vọng (chuẩn hóa)

                # Chạy thuật toán Huffman Encode và đo thời gian
                start_time = time.perf_counter()
                coder = HuffmanCoder()
                res = coder.encode(inp)
                actual = format_huffman_encode(res)
                t_ms = (time.perf_counter() - start_time) * 1000

                # So sánh kết quả thực tế vs kỳ vọng
                passed = (actual == expected)
                h_enc_results.append({
                    "input": inp,
                    "expected": expected,
                    "actual": actual,
                    "passed": passed,
                    "time": round(t_ms, 3)
                })
    except Exception as e:
        print("Lỗi huffman_encode_testcase.csv:", e)

    # ===================================================================
    # PHẦN 2: LZ77 ENCODE
    # Đọc test case từ file lz77_encode_test_case.csv
    # Mỗi dòng: Input (chuỗi gốc), Output (kết quả mã hóa kỳ vọng)
    # ===================================================================
    try:
        with open('lz77_encode_test_case.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)                # bỏ qua dòng header "Input,Output"
            for row in reader:
                if not row:
                    continue
                inp = row[0]            # chuỗi cần mã hóa
                expected = row[1].replace("\r", "")  # output kỳ vọng (chuẩn hóa)

                # Chạy thuật toán LZ77 Encode và đo thời gian
                start_time = time.perf_counter()
                coder = LZ77Coder()
                res = coder.encode(inp)
                actual = format_lz77_encode(res)
                t_ms = (time.perf_counter() - start_time) * 1000

                # So sánh kết quả thực tế vs kỳ vọng
                passed = (actual == expected)
                lz_enc_results.append({
                    "input": inp,
                    "expected": expected,
                    "actual": actual,
                    "passed": passed,
                    "time": round(t_ms, 3)
                })
    except Exception as e:
        print("Lỗi lz77_encode_test_case.csv:", e)

    # ===================================================================
    # PHẦN 3: HUFFMAN DECODE (ROUND-TRIP)
    # Không dùng file CSV riêng. Thay vào đó:
    #   - Lấy output THỰC TẾ của Huffman Encode (bảng mã + chuỗi bit).
    #   - Dùng decode_with_codes() để giải mã ngược.
    #   - Kiểm tra xem kết quả giải mã có khớp input gốc.
    # Mục đích: xác minh tính "round-trip" — encode rồi decode = bản gốc.
    # ===================================================================
    for enc_result in h_enc_results:
        original_text = enc_result["input"]   # chuỗi gốc ban đầu
        encode_output = enc_result["actual"]  # output thực tế của encode

        try:
            # Phân tích output encode → bảng mã + chuỗi bit
            codes, encoded_bits = parse_huffman_decode_input(encode_output)

            # Chạy thuật toán Huffman Decode và đo thời gian
            start_time = time.perf_counter()
            coder = HuffmanCoder()
            decoded_text = coder.decode_with_codes(encoded_bits, codes)
            t_ms = (time.perf_counter() - start_time) * 1000

            # Kết quả kỳ vọng = chuỗi gốc ban đầu
            passed = (decoded_text == original_text)
            h_dec_results.append({
                "input": encode_output,        # input cho decode = output encode
                "expected": original_text,     # kỳ vọng = chuỗi gốc
                "actual": decoded_text,        # kết quả giải mã thực tế
                "passed": passed,
                "time": round(t_ms, 3)
            })
        except Exception as e:
            h_dec_results.append({
                "input": encode_output,
                "expected": original_text,
                "actual": f"ERROR: {e}",
                "passed": False,
                "time": 0.0
            })

    # ===================================================================
    # PHẦN 4: LZ77 DECODE (ROUND-TRIP)
    # Không dùng file CSV riêng. Thay vào đó:
    #   - Lấy output THỰC TẾ của LZ77 Encode (danh sách token).
    #   - Dùng decode() để giải mã ngược.
    #   - Kiểm tra xem kết quả giải mã có khớp input gốc.
    # Mục đích: xác minh tính "round-trip" — encode rồi decode = bản gốc.
    # ===================================================================
    for enc_result in lz_enc_results:
        original_text = enc_result["input"]   # chuỗi gốc ban đầu
        encode_output = enc_result["actual"]  # output thực tế của encode

        try:
            # Phân tích output encode → danh sách Token
            tokens = parse_lz77_decode_input(encode_output)

            # Chạy thuật toán LZ77 Decode và đo thời gian
            start_time = time.perf_counter()
            coder = LZ77Coder()
            decoded_text = coder.decode(tokens)
            t_ms = (time.perf_counter() - start_time) * 1000

            # Kết quả kỳ vọng = chuỗi gốc ban đầu
            passed = (decoded_text == original_text)
            lz_dec_results.append({
                "input": encode_output,        # input cho decode = output encode
                "expected": original_text,     # kỳ vọng = chuỗi gốc
                "actual": decoded_text,        # kết quả giải mã thực tế
                "passed": passed,
                "time": round(t_ms, 3)
            })
        except Exception as e:
            lz_dec_results.append({
                "input": encode_output,
                "expected": original_text,
                "actual": f"ERROR: {e}",
                "passed": False,
                "time": 0.0
            })

    # ===================================================================
    # SINH BÁO CÁO HTML — Bao gồm 4 tab cho 4 phần kiểm thử
    # ===================================================================
    html_template = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Kiểm Thử — Huffman & LZ77</title>
    <style>
        :root {{ --bg: #1e1e2e; --surface: #313244; --text: #cdd6f4; --primary: #cba6f7; --success: #a6e3a1; --error: #f38ba8; --info: #89b4fa; }}
        body {{ font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 2rem; }}
        .container {{ max-width: 1400px; margin: 0 auto; background: var(--surface); padding: 2rem; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.3); }}
        h1 {{ text-align: center; color: var(--primary); margin-bottom: 0.5rem; }}
        .subtitle {{ text-align: center; color: #a6adc8; margin-bottom: 2rem; }}
        .tabs {{ display: flex; border-bottom: 2px solid #45475a; margin-bottom: 2rem; justify-content: center; gap: 1rem; flex-wrap: wrap; }}
        .tab {{ padding: 10px 20px; cursor: pointer; color: #a6adc8; font-weight: bold; font-size: 1.1rem; border-bottom: 3px solid transparent; }}
        .tab:hover {{ color: var(--text); }}
        .tab.active {{ color: var(--primary); border-bottom-color: var(--primary); }}
        .tab-content {{ display: none; }}
        .tab-content.active {{ display: block; }}
        table {{ width: 100%; border-collapse: collapse; text-align: left; table-layout: fixed; }}
        th, td {{ padding: 12px 15px; border-bottom: 1px solid #45475a; vertical-align: top; word-wrap: break-word; }}
        th {{ background-color: #181825; color: var(--info); font-weight: 600; }}
        tr:hover {{ background-color: #45475a; }}
        pre {{ margin: 0; white-space: pre-wrap; font-family: Consolas, monospace; font-size: 0.9em; }}
        .badge {{ padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 0.85rem; display: inline-block; }}
        .badge-pass {{ background: rgba(166, 227, 161, 0.2); color: var(--success); }}
        .badge-fail {{ background: rgba(243, 139, 168, 0.2); color: var(--error); }}
        .summary {{ display: flex; gap: 2rem; background: #181825; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; align-items: center; justify-content: space-around; flex-wrap: wrap; }}
        .stat-box {{ text-align: center; }}
        .stat-val {{ font-size: 2rem; font-weight: bold; color: var(--primary); }}
        .stat-label {{ color: #a6adc8; font-size: 0.9rem; margin-top: 0.5rem; }}
        .col-input {{ width: 20%; }}
        .col-expect {{ width: 30%; }}
        .col-actual {{ width: 30%; }}
        .col-status {{ width: 10%; }}
        .col-time {{ width: 10%; }}
        .note {{ background: #181825; border-left: 4px solid var(--info); padding: 1rem; margin-bottom: 1.5rem; border-radius: 4px; font-size: 0.95rem; color: #a6adc8; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Báo Cáo Kiểm Thử — Huffman & LZ77</h1>
        <div class="subtitle">Encode: kiểm thử từ file CSV &nbsp;|&nbsp; Decode: round-trip (output encode → input decode)</div>

        <div class="tabs">
            <div class="tab active" onclick="switchTab('h_enc')">Huffman Encode</div>
            <div class="tab" onclick="switchTab('lz_enc')">LZ77 Encode</div>
            <div class="tab" onclick="switchTab('h_dec')">Huffman Decode</div>
            <div class="tab" onclick="switchTab('lz_dec')">LZ77 Decode</div>
        </div>

        <div id="h_enc" class="tab-content active">
            <div class="note">
                📂 <strong>Nguồn dữ liệu:</strong> <code>huffman_encode_testcase.csv</code><br>
                🔍 <strong>Cách test:</strong> Đọc chuỗi Input từ CSV → chạy <code>HuffmanCoder.encode()</code> → so sánh output với cột Output trong CSV.
            </div>
        </div>
        <div id="lz_enc" class="tab-content">
            <div class="note">
                📂 <strong>Nguồn dữ liệu:</strong> <code>lz77_encode_test_case.csv</code><br>
                🔍 <strong>Cách test:</strong> Đọc chuỗi Input từ CSV → chạy <code>LZ77Coder.encode()</code> → so sánh output với cột Output trong CSV.
            </div>
        </div>
        <div id="h_dec" class="tab-content">
            <div class="note">
                🔄 <strong>Round-trip test:</strong> Không dùng file CSV riêng cho decode.<br>
                🔍 <strong>Cách test:</strong> Lấy output <strong>thực tế</strong> của Huffman Encode (bảng mã + chuỗi bit) → chạy <code>HuffmanCoder.decode_with_codes()</code> → kiểm tra kết quả giải mã có khớp chuỗi gốc ban đầu.
            </div>
        </div>
        <div id="lz_dec" class="tab-content">
            <div class="note">
                🔄 <strong>Round-trip test:</strong> Không dùng file CSV riêng cho decode.<br>
                🔍 <strong>Cách test:</strong> Lấy output <strong>thực tế</strong> của LZ77 Encode (danh sách token) → chạy <code>LZ77Coder.decode()</code> → kiểm tra kết quả giải mã có khớp chuỗi gốc ban đầu.
            </div>
        </div>
    </div>

    <script>
        // Dữ liệu kiểm thử được nhúng dưới dạng JSON
        const hEncData = {json.dumps(h_enc_results, ensure_ascii=False)};
        const lzEncData = {json.dumps(lz_enc_results, ensure_ascii=False)};
        const hDecData = {json.dumps(h_dec_results, ensure_ascii=False)};
        const lzDecData = {json.dumps(lz_dec_results, ensure_ascii=False)};

        // Chuyển tab khi click
        function switchTab(tabId) {{
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        }}

        // Render bảng kết quả cho mỗi tab
        function renderTable(containerId, data) {{
            const container = document.getElementById(containerId);
            const passed = data.filter(d => d.passed).length;
            const total = data.length;
            const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

            let html = `
                <div class="summary">
                    <div class="stat-box"><div class="stat-val">${{total}}</div><div class="stat-label">Tổng số Test Case</div></div>
                    <div class="stat-box"><div class="stat-val" style="color: var(--success)">${{passed}}</div><div class="stat-label">Passed</div></div>
                    <div class="stat-box"><div class="stat-val" style="color: var(--error)">${{total - passed}}</div><div class="stat-label">Failed</div></div>
                    <div class="stat-box"><div class="stat-val">${{passRate}}%</div><div class="stat-label">Tỉ lệ Pass</div></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th class="col-input">Input</th>
                            <th class="col-expect">Expected Output</th>
                            <th class="col-actual">Actual Output</th>
                            <th class="col-status">Kết quả</th>
                            <th class="col-time">Time (ms)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.forEach(d => {{
                const badge = d.passed ? '<span class="badge badge-pass">PASS</span>' : '<span class="badge badge-fail">FAIL</span>';
                const escapeHtml = (unsafe) => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
                html += `
                    <tr>
                        <td><pre>${{escapeHtml(d.input)}}</pre></td>
                        <td><pre>${{escapeHtml(d.expected)}}</pre></td>
                        <td><pre>${{escapeHtml(d.actual)}}</pre></td>
                        <td>${{badge}}</td>
                        <td>${{d.time}}</td>
                    </tr>
                `;
            }});

            html += `</tbody></table>`;
            // Giữ lại note (phần tử đầu) và thêm bảng sau nó
            const note = container.querySelector('.note');
            if (note) {{
                container.innerHTML = '';
                container.appendChild(note);
                container.insertAdjacentHTML('beforeend', html);
            }} else {{
                container.innerHTML = html;
            }}
        }}

        // Render bảng cho tất cả 4 tab
        renderTable('h_enc', hEncData);
        renderTable('lz_enc', lzEncData);
        renderTable('h_dec', hDecData);
        renderTable('lz_dec', lzDecData);
    </script>
</body>
</html>"""

    # Ghi file báo cáo HTML
    with open('visualize_report.html', 'w', encoding='utf-8') as f:
        f.write(html_template)

    # ===================================================================
    # IN TÓM TẮT KẾT QUẢ RA CONSOLE
    # ===================================================================
    total_tests = len(h_enc_results) + len(lz_enc_results) + len(h_dec_results) + len(lz_dec_results)
    total_passed = (
        sum(1 for r in h_enc_results if r["passed"]) +
        sum(1 for r in lz_enc_results if r["passed"]) +
        sum(1 for r in h_dec_results if r["passed"]) +
        sum(1 for r in lz_dec_results if r["passed"])
    )

    print("=" * 60)
    print("         KẾT QUẢ KIỂM THỬ TỔNG HỢP")
    print("=" * 60)
    print(f"  Huffman Encode : {sum(1 for r in h_enc_results if r['passed'])}/{len(h_enc_results)} passed")
    print(f"  LZ77 Encode    : {sum(1 for r in lz_enc_results if r['passed'])}/{len(lz_enc_results)} passed")
    print(f"  Huffman Decode : {sum(1 for r in h_dec_results if r['passed'])}/{len(h_dec_results)} passed  (round-trip)")
    print(f"  LZ77 Decode    : {sum(1 for r in lz_dec_results if r['passed'])}/{len(lz_dec_results)} passed  (round-trip)")
    print("-" * 60)
    print(f"  TỔNG CỘNG     : {total_passed}/{total_tests} passed")
    print("=" * 60)
    print(f"\nBáo cáo HTML: visualize_report.html")


if __name__ == "__main__":
    main()
