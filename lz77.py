"""
Thuật toán nén LZ77 (cửa sổ trượt - sliding window).

Mã hóa: duyệt chuỗi, tìm chuỗi khớp dài nhất trong "search buffer"
(phần đã xử lý, giới hạn bởi search_size). Mỗi bước xuất một bộ ba:

        (offset, length, next_char)

  - offset : khoảng lùi từ vị trí hiện tại tới đầu chuỗi khớp.
  - length : độ dài chuỗi khớp.
  - next_char : ký tự ngay sau chuỗi khớp (luôn có, kể cả khi length = 0).

Giải mã: tái tạo lại chuỗi gốc từ danh sách bộ ba, cho phép khớp
chồng lấn (length có thể lớn hơn offset).

Sử dụng:
    coder = LZ77Coder(search_size=8, lookahead_size=6)
    res = coder.encode("ABABCBABABCAD")
    tokens = res.tokens          # list[Token]
    text = coder.decode(tokens)
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Token:
    """Một bộ ba LZ77."""
    offset: int
    length: int
    next_char: str

    def __str__(self) -> str:
        return f"({self.offset}, {self.length}, {self.next_char!r})"


@dataclass
class LZ77Result:
    text: str
    tokens: list[Token] = field(default_factory=list)
    search_size: int = 8
    lookahead_size: int = 6

    @property
    def original_bits(self) -> int:
        """8 bit cho mỗi ký tự gốc."""
        return len(self.text) * 8

    @property
    def compressed_bits(self) -> int:
        """
        Ước lượng: mỗi token = bit(offset) + bit(length) + 8 bit ký tự.
        Số bit của offset/length lấy theo kích thước cửa sổ.
        """
        import math
        off_bits = max(1, math.ceil(math.log2(self.search_size + 1)))
        len_bits = max(1, math.ceil(math.log2(self.lookahead_size + 1)))
        return len(self.tokens) * (off_bits + len_bits + 8)

    @property
    def ratio(self) -> float:
        if self.original_bits == 0:
            return 0.0
        return self.compressed_bits / self.original_bits


class LZ77Coder:
    """Bộ mã hóa / giải mã LZ77."""

    def __init__(self, search_size: int = 8, lookahead_size: int = 6) -> None:
        self.search_size = search_size
        self.lookahead_size = lookahead_size

    # ----- MÃ HÓA -----

    def encode(self, text: str) -> LZ77Result:
        """Mã hóa chuỗi -> danh sách Token."""
        tokens: list[Token] = []
        if not text:
            return LZ77Result(text="", tokens=[],
                              search_size=self.search_size,
                              lookahead_size=self.lookahead_size)

        n = len(text)
        pos = 0
        while pos < n:
            search_start = max(0, pos - self.search_size)
            lookahead_end = min(n, pos + self.lookahead_size)
            lookahead_len = lookahead_end - pos

            best_offset = 0
            best_length = 0

            # Thử mọi vị trí bắt đầu trong search buffer.
            for i in range(search_start, pos):
                match_len = 0
                # So khớp, cho phép chồng lấn vào lookahead.
                while (match_len < lookahead_len
                       and pos + match_len < n
                       and text[i + match_len] == text[pos + match_len]):
                    match_len += 1
                # Phải chừa ít nhất 1 ký tự cho next_char.
                if match_len > best_length and match_len < lookahead_len:
                    best_length = match_len
                    best_offset = pos - i

            # Xác định ký tự tiếp theo (luôn xuất một ký tự).
            if pos + best_length < n:
                next_char = text[pos + best_length]
            elif best_length > 0:
                # Khớp chạm cuối chuỗi -> lùi 1 để có next_char.
                best_length -= 1
                next_char = text[pos + best_length]
            else:
                next_char = ""

            tokens.append(Token(best_offset, best_length, next_char))
            pos += best_length + 1

        return LZ77Result(text=text, tokens=tokens,
                          search_size=self.search_size,
                          lookahead_size=self.lookahead_size)

    # ----- GIẢI MÃ -----

    def decode(self, tokens: list[Token]) -> str:
        """Tái tạo chuỗi gốc từ danh sách Token."""
        out: list[str] = []
        for tok in tokens:
            if tok.length > 0:
                start = len(out) - tok.offset
                if start < 0:
                    raise ValueError(f"Offset không hợp lệ trong token {tok}.")
                # Sao chép từng ký tự để hỗ trợ khớp chồng lấn.
                for k in range(tok.length):
                    out.append(out[start + k])
            if tok.next_char != "":
                out.append(tok.next_char)
        return "".join(out)


def encode(text: str, search_size: int = 8, lookahead_size: int = 6) -> list[Token]:
    """Mã hóa chuỗi bằng LZ77, trả về danh sách Token (offset, length, next_char).

    >>> [str(t) for t in encode("ABABCBABABCAD")]
    ["(0, 0, 'A')", "(0, 0, 'B')", "(2, 2, 'C')", "(4, 3, 'A')", "(6, 2, 'A')", "(0, 0, 'D')"]
    """
    return LZ77Coder(search_size, lookahead_size).encode(text).tokens


def _parse_tokens(raw: str) -> list[Token]:
    """Phân tích chuỗi token '(0,0,A) (2,2,C) ...' -> list[Token]."""
    import re
    groups = re.findall(r"\(([^)]*)\)", raw)
    if not groups:                       # cho phép nhập không có ngoặc, mỗi dòng 1 token
        groups = [ln for ln in raw.splitlines() if ln.strip()]

    tokens: list[Token] = []
    for g in groups:
        parts = g.split(",", 2)          # offset, length, phần còn lại là ký tự
        if len(parts) < 2:
            raise ValueError(f"Token sai định dạng: ({g})")
        try:
            offset = int(parts[0].strip())
            length = int(parts[1].strip())
        except ValueError:
            raise ValueError(f"offset/length phải là số: ({g})")
        char = parts[2].strip().strip("'\"") if len(parts) > 2 else ""
        tokens.append(Token(offset, length, char))
    return tokens


def main() -> None:
    """Giao diện dòng lệnh: chọn encode/decode rồi nhập chuỗi."""
    # Chọn chế độ bằng số, lặp lại tới khi nhập hợp lệ.
    while True:
        choice = input("Chọn chế độ — 1: Mã hóa (encode), 2: Giải mã (decode): ").strip()
        if choice in ("1", "2"):
            break
        print("Nhập sai. Chỉ nhập 1 hoặc 2.")

    if choice == "1":                        # ----- MÃ HÓA -----
        text = input("Nhập chuỗi cần mã hóa: ")
        res = LZ77Coder().encode(text)
        tokens = " ".join(str(t) for t in res.tokens)
        print(f"Kết quả mã hóa : {tokens}")

    else:                                    # ----- GIẢI MÃ -----
        try:
            tokens = _parse_tokens(input("Nhập các token (vd (0,0,A) (0,0,B) ...): "))
            print(f"Kết quả giải mã: {LZ77Coder().decode(tokens)}")
        except ValueError as e:
            print(f"Lỗi: {e}")


if __name__ == "__main__":
    main()
