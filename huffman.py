"""
Thuật toán mã hóa Huffman (Huffman Coding).

Tách riêng phần thuật toán, không phụ thuộc giao diện.
Logic ưu tiên giống bản demo JS:
  - Gộp 2 nút có tần suất nhỏ nhất trước.
  - Khi gộp: nút có tần suất LỚN HƠN nằm bên TRÁI.
  - Nếu tần suất BẰNG NHAU: nút có id (tên) nhỏ hơn nằm bên TRÁI.
  - Cạnh trái = bit '0', cạnh phải = bit '1'.

Sử dụng:
    coder = HuffmanCoder()
    result = coder.encode("AAAAABBCDD")
    bits = result.encoded            # chuỗi bit
    codes = result.codes             # bảng mã {ký tự: chuỗi bit}
    text = coder.decode(bits, result.root)
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Node:
    """Một nút trong cây Huffman."""
    id: str                         # định danh (lá = ký tự, trong = ghép id con)
    freq: int                       # tần suất
    is_leaf: bool = False
    char: Optional[str] = None      # ký tự (chỉ nút lá)
    left: Optional["Node"] = None
    right: Optional["Node"] = None


@dataclass
class HuffmanResult:
    """Kết quả mã hóa một chuỗi."""
    text: str                       # chuỗi gốc
    root: Optional[Node]            # gốc cây Huffman
    codes: dict[str, str] = field(default_factory=dict)   # bảng mã
    encoded: str = ""               # chuỗi bit sau mã hóa

    @property
    def original_bits(self) -> int:
        """Số bit nếu mã hóa cố định (8 bit/ký tự)."""
        return len(self.text) * 8

    @property
    def compressed_bits(self) -> int:
        return len(self.encoded)

    @property
    def ratio(self) -> float:
        """Tỉ lệ nén = bit nén / bit gốc (càng nhỏ càng tốt)."""
        if self.original_bits == 0:
            return 0.0
        return self.compressed_bits / self.original_bits


class HuffmanCoder:
    """Bộ mã hóa / giải mã Huffman."""

    # ----- MÃ HÓA -----

    def build_tree(self, text: str) -> Optional[Node]:
        """Xây cây Huffman từ chuỗi đầu vào. Trả None nếu chuỗi rỗng."""
        if not text:
            return None

        # Tần suất các ký tự -> rừng các nút lá.
        freq = Counter(text)
        forest = [
            Node(id=ch, freq=f, is_leaf=True, char=ch)
            for ch, f in freq.items()
        ]

        # Trường hợp 1 loại ký tự: vẫn cần 1 nút gốc là chính nó.
        if len(forest) == 1:
            return forest[0]

        while len(forest) > 1:
            # Sắp xếp theo tần suất tăng, đồng hạng theo id.
            forest.sort(key=lambda n: (n.freq, n.id))

            n1 = forest.pop(0)
            n2 = forest.pop(0)

            # Quyết định con trái / con phải.
            if n1.freq > n2.freq:
                left, right = n1, n2
            elif n2.freq > n1.freq:
                left, right = n2, n1
            else:                       # bằng nhau -> id nhỏ hơn nằm trái
                if n1.id < n2.id:
                    left, right = n1, n2
                else:
                    left, right = n2, n1

            parent = Node(
                id=left.id + right.id,
                freq=left.freq + right.freq,
                is_leaf=False,
                left=left,
                right=right,
            )
            forest.append(parent)

        return forest[0]

    def build_codes(self, root: Optional[Node]) -> dict[str, str]:
        """Sinh bảng mã {ký tự: chuỗi bit} từ cây."""
        codes: dict[str, str] = {}
        if root is None:
            return codes

        # Cây chỉ có 1 nút lá -> gán mã '0'.
        if root.is_leaf:
            codes[root.char] = "0"
            return codes

        def walk(node: Node, prefix: str) -> None:
            if node.is_leaf:
                codes[node.char] = prefix
                return
            if node.left:
                walk(node.left, prefix + "0")
            if node.right:
                walk(node.right, prefix + "1")

        walk(root, "")
        return codes

    def encode(self, text: str) -> HuffmanResult:
        """Mã hóa chuỗi -> HuffmanResult (bảng mã + chuỗi bit + cây)."""
        root = self.build_tree(text)
        codes = self.build_codes(root)
        encoded = "".join(codes.get(ch, "") for ch in text)
        return HuffmanResult(text=text, root=root, codes=codes, encoded=encoded)

    # ----- GIẢI MÃ -----

    def decode(self, bits: str, root: Optional[Node]) -> str:
        """Giải mã chuỗi bit dựa trên cây Huffman."""
        if root is None or not bits:
            return ""

        # Cây 1 nút lá: mỗi bit '0' tương ứng 1 ký tự.
        if root.is_leaf:
            return root.char * len(bits)

        result: list[str] = []
        node = root
        for bit in bits:
            if bit not in ("0", "1"):
                raise ValueError(f"Bit không hợp lệ: {bit!r}")
            node = node.left if bit == "0" else node.right
            if node is None:
                raise ValueError("Chuỗi bit không khớp cây Huffman.")
            if node.is_leaf:
                result.append(node.char)
                node = root

        if node is not root:
            raise ValueError("Chuỗi bit thừa, không kết thúc tại một lá.")

        return "".join(result)

    def decode_with_codes(self, bits: str, codes: dict[str, str]) -> str:
        """Giải mã chỉ từ bảng mã (không cần cây) — so khớp tiền tố."""
        if not bits:
            return ""
        # Đảo bảng mã: {chuỗi bit: ký tự}.
        inverse = {code: ch for ch, code in codes.items()}
        result: list[str] = []
        buffer = ""
        for bit in bits:
            buffer += bit
            if buffer in inverse:
                result.append(inverse[buffer])
                buffer = ""
        if buffer:
            raise ValueError("Chuỗi bit thừa, không khớp mã nào.")
        return "".join(result)


def encode(text: str) -> str:
    """Mã hóa chuỗi bằng Huffman, trả về chuỗi bit kết quả.

    >>> encode("AAAAABBCDD")
    '000001001001011111'
    """
    return HuffmanCoder().encode(text).encoded


def _parse_table(raw: str) -> dict[str, str]:
    """Phân tích bảng mã -> {ký tự: mã}.

    Chấp nhận phân tách bằng xuống dòng hoặc dấu phẩy, mỗi cặp dạng
    'A=101'. Tự chuẩn hóa khoảng trắng: 'A=10', 'A = 10', 'A= 10' đều OK.

        A=101
        B=110
        L=00
    """
    import re
    codes: dict[str, str] = {}
    for part in re.split(r"[\n,]", raw):     # tách theo dòng hoặc dấu phẩy
        part = part.strip()
        if not part:
            continue
        if "=" not in part:
            raise ValueError(f"Sai định dạng cặp mã: {part!r}")
        ch, code = part.rsplit("=", 1)       # rsplit để ký tự có thể là '='
        ch, code = ch.strip(), code.strip()
        if not ch or not code:
            raise ValueError(f"Thiếu ký tự hoặc mã: {part!r}")
        codes[ch] = code
    return codes


def main() -> None:
    """Giao diện dòng lệnh: chọn encode/decode rồi nhập chuỗi."""
    coder = HuffmanCoder()

    # Chọn chế độ bằng số, lặp lại tới khi nhập hợp lệ.
    while True:
        choice = input("Chọn chế độ — 1: Mã hóa (encode), 2: Giải mã (decode): ").strip()
        if choice in ("1", "2"):
            break
        print("Nhập sai. Chỉ nhập 1 hoặc 2.")

    if choice == "1":                        # ----- MÃ HÓA -----
        text = input("Nhập chuỗi cần mã hóa: ")
        res = coder.encode(text)
        table = ", ".join(f"{ch}={c}" for ch, c in sorted(res.codes.items()))
        print(f"Bảng mã        : {table}")
        print(f"Kết quả mã hóa : {res.encoded}")

    else:                                    # ----- GIẢI MÃ -----
        print("Giải mã Huffman cần bảng mã (lấy từ bước mã hóa).")
        print("Nhập bảng mã, mỗi dòng một cặp (vd  A=101). Nhập xong để TRỐNG 1 dòng:")
        lines: list[str] = []
        while True:
            try:
                line = input()
            except EOFError:
                break
            if line.strip() == "":
                break
            lines.append(line)
        try:
            codes = _parse_table("\n".join(lines))
            bits = input("Nhập chuỗi bit cần giải mã: ").strip()
            print(f"Kết quả giải mã: {coder.decode_with_codes(bits, codes)}")
        except ValueError as e:
            print(f"Lỗi: {e}")


if __name__ == "__main__":
    main()
