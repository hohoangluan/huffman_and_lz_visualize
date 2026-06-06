import csv
import json
import time
from huffman import HuffmanCoder
from lz77 import LZ77Coder

def format_huffman_encode(res):
    lines = [str(len(res.codes))]
    for ch, code in sorted(res.codes.items()):
        lines.append(f"{ch} {code}")
    lines.append(res.encoded)
    return "\n".join(lines)

def format_lz77_encode(res):
    lines = [str(len(res.tokens))]
    for t in res.tokens:
        lines.append(f"{t.offset} {t.length} {t.next_char}")
    return "\n".join(lines)

def parse_huffman_decode_input(inp):
    lines = inp.replace("\r", "").split("\n")
    num_codes = int(lines[0])
    codes = {}
    for i in range(1, num_codes + 1):
        line = lines[i]
        parts = line.rsplit(' ', 1)
        ch = parts[0]
        code = parts[1]
        codes[ch] = code
    encoded = lines[num_codes + 1]
    return codes, encoded

def parse_lz77_decode_input(inp):
    from lz77 import Token
    lines = inp.replace("\r", "").split("\n")
    num_tokens = int(lines[0])
    tokens = []
    for i in range(1, num_tokens + 1):
        line = lines[i]
        parts = line.split(' ', 2)
        offset = int(parts[0])
        length = int(parts[1])
        next_char = parts[2] if len(parts) > 2 else ""
        tokens.append(Token(offset, length, next_char))
    return tokens

def main():
    h_enc_results = []
    lz_enc_results = []
    h_dec_results = []
    lz_dec_results = []

    # 1. huffman_encode.csv
    try:
        with open('huffman_encode.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                if not row: continue
                inp = row[0]
                expected = row[1].replace("\r", "")
                
                start_time = time.perf_counter()
                coder = HuffmanCoder()
                res = coder.encode(inp)
                actual = format_huffman_encode(res)
                t_ms = (time.perf_counter() - start_time) * 1000
                
                passed = (actual == expected)
                h_enc_results.append({
                    "input": inp, "expected": expected, "actual": actual, "passed": passed, "time": round(t_ms, 3)
                })
    except Exception as e: print("Lỗi huffman_encode.csv:", e)

    # 2. lz77_encode.csv
    try:
        with open('lz77_encode.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                if not row: continue
                inp = row[0]
                expected = row[1].replace("\r", "")
                
                start_time = time.perf_counter()
                coder = LZ77Coder()
                res = coder.encode(inp)
                actual = format_lz77_encode(res)
                t_ms = (time.perf_counter() - start_time) * 1000
                
                passed = (actual == expected)
                lz_enc_results.append({
                    "input": inp, "expected": expected, "actual": actual, "passed": passed, "time": round(t_ms, 3)
                })
    except Exception as e: print("Lỗi lz77_encode.csv:", e)

    # 3. huffman_decode.csv
    try:
        with open('huffman_decode.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                if not row: continue
                inp = row[0]
                expected = row[1]
                
                codes, encoded = parse_huffman_decode_input(inp)
                start_time = time.perf_counter()
                coder = HuffmanCoder()
                try:
                    actual = coder.decode_with_codes(encoded, codes)
                    passed = (actual == expected)
                except Exception as e:
                    actual = f"ERROR: {e}"
                    passed = False
                t_ms = (time.perf_counter() - start_time) * 1000
                
                h_dec_results.append({
                    "input": inp, "expected": expected, "actual": actual, "passed": passed, "time": round(t_ms, 3)
                })
    except Exception as e: print("Lỗi huffman_decode.csv:", e)

    # 4. lz77_decode.csv
    try:
        with open('lz77_decode.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                if not row: continue
                inp = row[0]
                expected = row[1]
                
                tokens = parse_lz77_decode_input(inp)
                start_time = time.perf_counter()
                coder = LZ77Coder()
                try:
                    actual = coder.decode(tokens)
                    passed = (actual == expected)
                except Exception as e:
                    actual = f"ERROR: {e}"
                    passed = False
                t_ms = (time.perf_counter() - start_time) * 1000
                
                lz_dec_results.append({
                    "input": inp, "expected": expected, "actual": actual, "passed": passed, "time": round(t_ms, 3)
                })
    except Exception as e: print("Lỗi lz77_decode.csv:", e)

    html_template = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Kiểm Thử (Bám Sát CSV)</title>
    <style>
        :root {{ --bg: #1e1e2e; --surface: #313244; --text: #cdd6f4; --primary: #cba6f7; --success: #a6e3a1; --error: #f38ba8; --info: #89b4fa; }}
        body {{ font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 2rem; }}
        .container {{ max-width: 1400px; margin: 0 auto; background: var(--surface); padding: 2rem; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.3); }}
        h1 {{ text-align: center; color: var(--primary); margin-bottom: 0.5rem; }}
        .subtitle {{ text-align: center; color: #a6adc8; margin-bottom: 2rem; }}
        .tabs {{ display: flex; border-bottom: 2px solid #45475a; margin-bottom: 2rem; justify-content: center; gap: 1rem; }}
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
        .summary {{ display: flex; gap: 2rem; background: #181825; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; align-items: center; justify-content: space-around; }}
        .stat-box {{ text-align: center; }}
        .stat-val {{ font-size: 2rem; font-weight: bold; color: var(--primary); }}
        .stat-label {{ color: #a6adc8; font-size: 0.9rem; margin-top: 0.5rem; }}
        .col-input {{ width: 20%; }}
        .col-expect {{ width: 30%; }}
        .col-actual {{ width: 30%; }}
        .col-status {{ width: 10%; }}
        .col-time {{ width: 10%; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Báo Cáo Kiểm Thử (Bám sát file .csv)</h1>
        <div class="subtitle">Mỗi tab phản ánh chính xác kết quả kiểm thử trên 1 file CSV</div>
        
        <div class="tabs">
            <div class="tab active" onclick="switchTab('h_enc')">huffman_encode.csv</div>
            <div class="tab" onclick="switchTab('lz_enc')">lz77_encode.csv</div>
            <div class="tab" onclick="switchTab('h_dec')">huffman_decode.csv</div>
            <div class="tab" onclick="switchTab('lz_dec')">lz77_decode.csv</div>
        </div>
        
        <div id="h_enc" class="tab-content active"></div>
        <div id="lz_enc" class="tab-content"></div>
        <div id="h_dec" class="tab-content"></div>
        <div id="lz_dec" class="tab-content"></div>
    </div>

    <script>
        const hEncData = {json.dumps(h_enc_results)};
        const lzEncData = {json.dumps(lz_enc_results)};
        const hDecData = {json.dumps(h_dec_results)};
        const lzDecData = {json.dumps(lz_dec_results)};
        
        function switchTab(tabId) {{
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        }}

        function renderTable(containerId, data, title) {{
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
                            <th class="col-input">Input (từ CSV)</th>
                            <th class="col-expect">Expected Output (từ CSV)</th>
                            <th class="col-actual">Actual Output (Thuật toán)</th>
                            <th class="col-status">Kết quả</th>
                            <th class="col-time">Time (ms)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            data.forEach(d => {{
                const badge = d.passed ? '<span class="badge badge-pass">PASS</span>' : '<span class="badge badge-fail">FAIL</span>';
                // escape html to prevent XSS and formatting issues
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
            container.innerHTML = html;
        }}

        renderTable('h_enc', hEncData, 'Huffman Encode');
        renderTable('lz_enc', lzEncData, 'LZ77 Encode');
        renderTable('h_dec', hDecData, 'Huffman Decode');
        renderTable('lz_dec', lzDecData, 'LZ77 Decode');
    </script>
</body>
</html>"""

    with open('visualize_report.html', 'w', encoding='utf-8') as f:
        f.write(html_template)

    print("Test cases completed successfully.")
    print("Report generated at: visualize_report.html")

if __name__ == "__main__":
    main()
