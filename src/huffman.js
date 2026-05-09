// ==========================================
// COMPONENT MÃ HÓA (HUFFMAN BUILDER)
// ==========================================

const parseInput = (str) => {
    if (!str || str.length === 0) return [];
    const freqMap = {};
    for (let char of str) {
        freqMap[char] = (freqMap[char] || 0) + 1;
    }
    const result = [];
    for (let char in freqMap) {
        result.push({ id: char, label: char, f: freqMap[char], isLeaf: true });
    }
    return result;
};

const generateHuffmanSteps = (inputStr) => {
    const initialNodes = parseInput(inputStr);
    if (initialNodes.length === 0) {
        return { steps: [], allNodes: {} };
    }

    let forest = [...initialNodes];
    let allNodes = {};
    initialNodes.forEach(n => allNodes[n.id] = { ...n });

    let steps = [];
    let currentEdges = [];
    let currentVisibleNodes = new Set(initialNodes.map(n => n.id));

    steps.push({
        activeRoots: forest.map(n => n.id),
        visibleNodes: Array.from(currentVisibleNodes),
        edges: [],
        highlighted: [],
        action: "Bắt đầu tính tần suất và tạo các nút lá.",
        queueLabel: forest.map(n => `${n.id}(${n.f})`).join(", ")
    });

    while (forest.length > 1) {
        forest.sort((a, b) => {
            if (a.f !== b.f) return a.f - b.f;
            return a.id.localeCompare(b.id);
        });

        let n1 = forest.shift();
        let n2 = forest.shift();

        let leftChild, rightChild;
        if (n1.f > n2.f) {
            leftChild = n1; rightChild = n2;
        } else if (n2.f > n1.f) {
            leftChild = n2; rightChild = n1;
        } else {
            if (n1.id.localeCompare(n2.id) < 0) {
                leftChild = n1; rightChild = n2;
            } else {
                leftChild = n2; rightChild = n1;
            }
        }

        let parentId = leftChild.id + rightChild.id;
        let parent = {
            id: parentId,
            label: parentId,
            f: leftChild.f + rightChild.f,
            left: leftChild.id,
            right: rightChild.id,
            isLeaf: false
        };

        allNodes[parentId] = parent;
        forest.push(parent);
        currentVisibleNodes.add(parentId);

        currentEdges.push({ parent: parentId, child: leftChild.id, label: "0", isLeft: true });
        currentEdges.push({ parent: parentId, child: rightChild.id, label: "1", isLeft: false });

        let displayQueue = [...forest].sort((a, b) => {
            if (a.f !== b.f) return a.f - b.f;
            return a.id.localeCompare(b.id);
        });

        steps.push({
            activeRoots: forest.map(n => n.id),
            visibleNodes: Array.from(currentVisibleNodes),
            edges: [...currentEdges],
            highlighted: [parentId, leftChild.id, rightChild.id],
            action: `Gộp 2 nút nhỏ nhất: ${leftChild.id}(${leftChild.f}) và ${rightChild.id}(${rightChild.f}) thành nút mới ${parentId}(${parent.f}).`,
            queueLabel: displayQueue.map(n => `${n.id}(${n.f})`).join(", ")
        });
    }

    const root = forest[0];
    let huffmanCodes = {};
    let encodedString = "";
    
    if (root) {
        const assignCoordinates = (nodeId, x, y, xOffset) => {
            let node = allNodes[nodeId];
            if (!node) return;
            node.x = x;
            node.y = y;
            if (node.left) assignCoordinates(node.left, x - xOffset, y + 100, xOffset * 0.55);
            if (node.right) assignCoordinates(node.right, x + xOffset, y + 100, xOffset * 0.55);
        };
        assignCoordinates(root.id, 500, 60, 220);

        // Tính toán bảng mã Huffman
        const generateCodes = (nodeId, currentCode) => {
            let node = allNodes[nodeId];
            if (!node) return;
            if (node.isLeaf) {
                huffmanCodes[node.id] = currentCode;
            } else {
                generateCodes(node.left, currentCode + '0');
                generateCodes(node.right, currentCode + '1');
            }
        };
        generateCodes(root.id, "");

        // Xử lý trường hợp chỉ có 1 loại ký tự duy nhất
        if (Object.keys(huffmanCodes).length === 1) {
            huffmanCodes[Object.keys(huffmanCodes)[0]] = "0";
        }
        
        // Mã hóa chuỗi đầu vào
        for (let char of inputStr) {
            encodedString += huffmanCodes[char] || "";
        }
    }

    steps.push({
        activeRoots: [root?.id],
        visibleNodes: Array.from(currentVisibleNodes),
        edges: [...currentEdges],
        highlighted: [root?.id],
        action: "🎉 Hoàn tất quá trình xây dựng cây Huffman!",
        queueLabel: root ? `${root.id}(${root.f})` : "",
        encodedString: encodedString,
        huffmanCodes: huffmanCodes
    });

    return { steps, allNodes };
};

function HuffmanBuilder() {
    const [inputText, setInputText] = useState("AAAAABBCDD");
    const { steps, allNodes } = useMemo(() => generateHuffmanSteps(inputText), [inputText]);

    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1200);

    const currentStepIndex = Math.min(step, Math.max(0, steps.length - 1));
    const currentState = steps[currentStepIndex];
    const isFinished = currentStepIndex === steps.length - 1;

    useEffect(() => {
        setStep(0);
        setIsPlaying(false);
    }, [inputText]);

    useEffect(() => {
        let interval;
        if (isPlaying && !isFinished) {
            interval = setInterval(() => {
                setStep(s => {
                    if (s >= steps.length - 2) {
                        setIsPlaying(false);
                        return steps.length - 1;
                    }
                    return s + 1;
                });
            }, speed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isFinished, speed, steps.length]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1));
    const prevStep = () => setStep(s => Math.max(s - 1, 0));
    const reset = () => {
        setIsPlaying(false);
        setStep(0);
    };

    if (!currentState) {
        return (
            <div className="w-full flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow border border-slate-200">
                    <h2 className="text-xl text-slate-800 mb-4">Vui lòng nhập chuỗi ký tự</h2>
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full border p-2 rounded outline-blue-500"
                        placeholder="VD: AAAAABBCDD"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Mô Phỏng Xây Dựng Cây Huffman</h1>
                <p className="text-slate-500 mt-2">Dựa trên logic ưu tiên: Nhỏ nhất ghép trước, <b>lớn hơn nằm Trái, bằng nhau xếp Trái theo tên</b>.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="font-semibold text-slate-700">Hình ảnh Cây (Tự động canh tọa độ)</span>
                        <span className="text-xs font-mono bg-orange-100 text-orange-800 px-2 py-1 rounded-full border border-orange-200">
                            Bước {currentStepIndex + 1} / {steps.length}
                        </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4 bg-[#fcfdfd] min-h-[400px]">
                        <svg viewBox="0 0 1000 600" className="w-full h-auto max-h-[50vh] object-contain">
                            <defs>
                                <filter id="glow-encode" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="6" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <filter id="shadow-encode">
                                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1"/>
                                </filter>
                            </defs>
                            {currentState.edges.map((edge, idx) => {
                                const p = allNodes[edge.parent];
                                const c = allNodes[edge.child];
                                if (!p || !c) return null;
                                const isHighlighted = currentState.highlighted.includes(p.id) && currentState.highlighted.includes(c.id);
                                const midX = (p.x + c.x) / 2;
                                const midY = (p.y + c.y) / 2;
                                const txtX = midX + (edge.isLeft ? -15 : 15);
                                const txtY = midY - 10;
                                return (
                                    <g key={idx} className="transition-all duration-500 ease-in-out" style={{opacity: 1}}>
                                        <line x1={p.x} y1={p.y} x2={c.x} y2={c.y} 
                                            stroke={isHighlighted ? '#F97316' : '#CBD5E1'} 
                                            strokeWidth={isHighlighted ? 3 : 2} />
                                        <text x={txtX} y={txtY} 
                                            fill={isHighlighted ? '#EA580C' : '#64748B'} 
                                            className="font-bold text-lg" 
                                            textAnchor="middle">
                                            {edge.label}
                                        </text>
                                    </g>
                                );
                            })}
                            {currentState.visibleNodes.map(nodeId => {
                                const node = allNodes[nodeId];
                                if (!node) return null;
                                const isHighlighted = currentState.highlighted.includes(nodeId);
                                const isLeaf = node.isLeaf;
                                const isRootNow = currentState.activeRoots.includes(nodeId);
                                return (
                                    <g key={nodeId} 
                                    className="transition-all duration-500 ease-in-out" 
                                    style={{ transformOrigin: `${node.x}px ${node.y}px`, transform: 'scale(1)' }}>
                                        <ellipse cx={node.x} cy={node.y} rx={55} ry={35}
                                                fill={isHighlighted ? '#FFEDD5' : (isRootNow ? '#F0FDF4' : (isLeaf ? '#F8FAFC' : '#ffffff'))}
                                                stroke={isHighlighted ? '#F97316' : (isRootNow ? '#22C55E' : (isLeaf ? '#94A3B8' : '#CBD5E1'))}
                                                strokeWidth={isHighlighted ? 3 : 2}
                                                filter="url(#shadow-encode)" />
                                        <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central"
                                            className={`font-mono text-base ${isHighlighted ? 'font-bold text-orange-900' : 'text-slate-800'}`}>
                                            {node.label}({node.f})
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
                <div className="flex flex-col space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Nhập chuỗi ký tự bất kỳ</label>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                            placeholder="VD: AAAAABBCDD"
                        />
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-3 font-semibold">Tần suất & Hàng đợi (Đã sắp xếp)</span>
                        <div className="text-lg font-mono tracking-wider text-emerald-700 font-medium break-all min-h-[30px]">
                            {currentState.queueLabel || "Hàng đợi trống"}
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center flex-1 min-h-[140px]">
                        <span className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Thao tác ở bước này</span>
                        <p className="text-lg font-medium text-slate-800">{currentState.action}</p>
                    </div>

                    {currentState.encodedString && (
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 animate-[fadeIn_0.5s_ease-in-out]">
                            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Kết Quả Mã Hóa (Bảng mã & Chuỗi bit)</span>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {Object.entries(currentState.huffmanCodes).map(([char, code]) => (
                                    <span key={char} className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 shadow-sm">
                                        <b>{char}</b>: <span className="text-orange-600 font-bold">{code}</span>
                                    </span>
                                ))}
                            </div>
                            <div className="text-xl font-mono tracking-widest text-emerald-600 font-bold break-all bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                {currentState.encodedString}
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 font-medium">Tốc độ chạy</span>
                            <select value={speed} onChange={e => setSpeed(Number(e.target.value))}
                                    className="border border-slate-300 rounded-lg px-2 py-1 bg-slate-50 text-sm outline-none focus:border-blue-500">
                                <option value={2000}>Chậm</option>
                                <option value={1200}>Bình thường</option>
                                <option value={500}>Nhanh</option>
                            </select>
                        </div>
                        <div className="flex justify-center space-x-3">
                            <button onClick={reset} title="Khôi phục" 
                                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors">
                                <ResetIcon />
                            </button>
                            <button onClick={prevStep} disabled={currentStepIndex === 0} title="Lùi lại"
                                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <PrevIcon />
                            </button>
                            <button onClick={togglePlay} disabled={isFinished} title={isPlaying ? "Tạm dừng" : "Phát"}
                                    className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95">
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                            <button onClick={nextStep} disabled={isFinished} title="Tiến tới"
                                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <NextIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// COMPONENT GIẢI MÃ (HUFFMAN ANIMATION)
// ==========================================

const TREE_DATA = {
    "ABCD": { id: "ABCD", label: "ABCD(9)", x: 500, y: 80, left: "A", right: "BCD" },
    "A": { id: "A", label: "A(5)", x: 300, y: 220, isLeaf: true, char: "A" },
    "BCD": { id: "BCD", label: "BCD(4)", x: 700, y: 220, left: "B", right: "CD" },
    "B": { id: "B", label: "B(2)", x: 550, y: 360, isLeaf: true, char: "B" },
    "CD": { id: "CD", label: "CD(2)", x: 850, y: 360, left: "C", right: "D" },
    "C": { id: "C", label: "C(1)", x: 750, y: 500, isLeaf: true, char: "C" },
    "D": { id: "D", label: "D(1)", x: 950, y: 500, isLeaf: true, char: "D" }
};

const EDGES = [
    { parent: "ABCD", child: "A", label: "0" },
    { parent: "ABCD", child: "BCD", label: "1" },
    { parent: "BCD", child: "B", label: "0" },
    { parent: "BCD", child: "CD", label: "1" },
    { parent: "CD", child: "C", label: "0" },
    { parent: "CD", child: "D", label: "1" }
];

const generateHuffmanDecodeStates = (bits) => {
    let states = [];
    let decoded = "";
    let currNode = "ABCD";
    let path = ["ABCD"];

    if (!bits || bits.length === 0) {
        return [{
            bitIdx: 0,
            node: "ABCD",
            path: ["ABCD"],
            decoded: "",
            action: "Vui lòng nhập chuỗi bit (0 và 1) để bắt đầu.",
            activeBit: null
        }];
    }

    states.push({
        bitIdx: 0,
        node: currNode,
        path: [...path],
        decoded: decoded,
        action: "Bắt đầu tại node gốc.",
        activeBit: null
    });

    for (let i = 0; i < bits.length; i++) {
        let bit = bits[i];
        let nextNode = bit === '0' ? TREE_DATA[currNode].left : TREE_DATA[currNode].right;
        
        currNode = nextNode;
        path.push(currNode);

        if (TREE_DATA[currNode].isLeaf) {
            decoded += TREE_DATA[currNode].char;
            states.push({
                bitIdx: i + 1,
                node: currNode,
                path: [...path],
                decoded: decoded,
                action: `Đọc bit '${bit}', đến lá ${TREE_DATA[currNode].char}. Giải mã thành '${TREE_DATA[currNode].char}'.`,
                activeBit: i
            });
            
            currNode = "ABCD";
            path = ["ABCD"];
            if (i < bits.length - 1) {
                states.push({
                    bitIdx: i + 1,
                    node: currNode,
                    path: [...path],
                    decoded: decoded,
                    action: "Quay lại gốc. Chuẩn bị đọc bit tiếp theo.",
                    activeBit: null
                });
            }
        } else {
            states.push({
                bitIdx: i + 1,
                node: currNode,
                path: [...path],
                decoded: decoded,
                action: `Đọc bit '${bit}', rẽ sang ${bit === '0' ? 'trái' : 'phải'} đến ${TREE_DATA[currNode].label}.`,
                activeBit: i
            });
        }
    }
    
    states.push({
        bitIdx: bits.length,
        node: "ABCD",
        path: [],
        decoded: decoded,
        action: "🎉 Hoàn tất quá trình giải mã!",
        activeBit: null
    });
    
    return states;
};

function HuffmanAnimation() {
    const [inputBits, setInputBits] = useState("000101011011100");
    const states = useMemo(() => generateHuffmanDecodeStates(inputBits), [inputBits]);
    
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(800);

    const currentState = states[step];
    const isFinished = step === states.length - 1;

    useEffect(() => {
        setStep(0);
        setIsPlaying(false);
    }, [inputBits]);

    useEffect(() => {
        let interval;
        if (isPlaying && !isFinished) {
            interval = setInterval(() => {
                setStep(s => {
                    if (s >= states.length - 2) {
                        setIsPlaying(false);
                        return states.length - 1;
                    }
                    return s + 1;
                });
            }, speed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isFinished, speed, states.length]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const nextStep = () => setStep(s => Math.min(s + 1, states.length - 1));
    const prevStep = () => setStep(s => Math.max(s - 1, 0));
    const reset = () => {
        setIsPlaying(false);
        setStep(0);
    };

    return (
        <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Mô Phỏng Giải Mã Huffman</h1>
                <p className="text-slate-500 mt-2">Theo dõi luồng duyệt cây từ chuỗi bit <code className="bg-slate-100 px-2 py-1 rounded text-emerald-600 font-bold">{inputBits || "trống"}</code>.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="font-semibold text-slate-700">Cây Huffman</span>
                        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Trạng thái: Node {currentState.node}
                        </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4 bg-[#fcfdfd]">
                        <svg viewBox="0 0 1000 580" className="w-full h-auto max-h-[50vh] object-contain">
                            <defs>
                                <filter id="glow-decode" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="6" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                            {EDGES.map(edge => {
                                const p = TREE_DATA[edge.parent];
                                const c = TREE_DATA[edge.child];
                                
                                const pIdx = currentState.path.indexOf(edge.parent);
                                const cIdx = currentState.path.indexOf(edge.child);
                                const isActiveEdge = pIdx !== -1 && cIdx !== -1 && cIdx === pIdx + 1;
                                
                                const midX = (p.x + c.x) / 2;
                                const midY = (p.y + c.y) / 2;
                                const isLeft = c.x < p.x;
                                const txtX = midX + (isLeft ? -18 : 18);
                                const txtY = midY - 12;

                                return (
                                    <g key={`${edge.parent}-${edge.child}`} className="transition-all duration-300">
                                        <line x1={p.x} y1={p.y} x2={c.x} y2={c.y} 
                                            stroke={isActiveEdge ? '#F97316' : '#CBD5E1'} 
                                            strokeWidth={isActiveEdge ? 4 : 2} />
                                        <text x={txtX} y={txtY} 
                                            fill={isActiveEdge ? '#EA580C' : '#64748B'} 
                                            className="font-bold text-xl" 
                                            textAnchor="middle">
                                            {edge.label}
                                        </text>
                                    </g>
                                );
                            })}
                            {Object.values(TREE_DATA).map(node => {
                                const isActiveNode = currentState.node === node.id;
                                const isLeaf = node.isLeaf;
                                return (
                                    <g key={node.id} className="transition-all duration-300">
                                        <ellipse cx={node.x} cy={node.y} rx={55} ry={35}
                                                fill={isActiveNode ? '#FFEDD5' : (isLeaf ? '#E0F2FE' : '#ffffff')}
                                                stroke={isActiveNode ? '#F97316' : (isLeaf ? '#0284C7' : '#475569')}
                                                strokeWidth={isActiveNode ? 4 : 2}
                                                filter={isActiveNode ? "url(#glow-decode)" : ""} />
                                        <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central"
                                            className={`font-mono text-base ${isActiveNode ? 'font-bold text-orange-900' : 'text-slate-800'}`}>
                                            {node.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
                <div className="flex flex-col space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center min-h-[120px]">
                        <span className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Hoạt động hiện tại</span>
                        <p className="text-lg font-medium text-slate-800">{currentState.action}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Nhập chuỗi bit (0, 1)</label>
                        <input 
                            type="text" 
                            value={inputBits}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^01]/g, '');
                                setInputBits(val);
                            }}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-lg font-mono tracking-widest focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                            placeholder="Nhập bit..."
                        />
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-3 font-semibold">Tiến trình đọc bit</span>
                        <div className="text-2xl font-mono tracking-wider break-all leading-relaxed min-h-[40px]">
                            {inputBits.split('').map((bit, idx) => {
                                let className = "text-slate-300";
                                if (idx < currentState.bitIdx) className = "text-emerald-500 font-semibold";
                                if (idx === currentState.activeBit) className = "bg-orange-500 text-white rounded px-1.5 py-0.5 shadow-sm transform scale-110 inline-block font-bold";
                                
                                return <span key={idx} className={`inline-block mx-0.5 transition-all duration-200 ${className}`}>{bit}</span>
                            })}
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex-1">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-3 font-semibold">Kết quả giải mã</span>
                        <div className="text-3xl font-mono tracking-widest text-emerald-600 font-bold break-all">
                            {currentState.decoded || <span className="text-slate-200 font-normal">Đang chờ...</span>}
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 font-medium">Tiến trình: {step} / {states.length - 1}</span>
                            <select value={speed} onChange={e => setSpeed(Number(e.target.value))}
                                    className="border border-slate-300 rounded-lg px-2 py-1 bg-slate-50 text-sm outline-none focus:border-blue-500">
                                <option value={1500}>Rất chậm</option>
                                <option value={800}>Bình thường</option>
                                <option value={300}>Nhanh</option>
                            </select>
                        </div>
                        <div className="flex justify-center space-x-3">
                            <button onClick={reset} title="Khôi phục" 
                                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors">
                                <ResetIcon />
                            </button>
                            <button onClick={prevStep} disabled={step === 0} title="Lùi lại"
                                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <PrevIcon />
                            </button>
                            <button onClick={togglePlay} disabled={isFinished} title={isPlaying ? "Tạm dừng" : "Phát"}
                                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95">
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                            <button onClick={nextStep} disabled={isFinished} title="Tiến tới"
                                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <NextIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
