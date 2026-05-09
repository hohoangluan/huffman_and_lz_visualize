// ==========================================
// THUẬT TOÁN LZ77
// ==========================================

const generateLZ77EncodeSteps = (inputStr, searchSize = 8, lookaheadSize = 6) => {
    let steps = [];
    let pos = 0;
    let output = [];

    if (!inputStr) {
        return { steps: [], output: [] };
    }

    steps.push({
        pos: 0,
        searchSize,
        lookaheadSize,
        matchOffset: 0,
        matchLength: 0,
        nextChar: '',
        action: "Bắt đầu thuật toán LZ77. Khởi tạo cửa sổ trượt.",
        currentOutput: []
    });

    while (pos < inputStr.length) {
        let searchStart = Math.max(0, pos - searchSize);
        let searchBuffer = inputStr.substring(searchStart, pos);
        let lookaheadBuffer = inputStr.substring(pos, Math.min(inputStr.length, pos + lookaheadSize));

        let bestOffset = 0;
        let bestLength = 0;

        // Find longest match
        for (let i = 0; i < searchBuffer.length; i++) {
            let length = 0;
            while (
                length < lookaheadBuffer.length - 1 && // Leave 1 char for nextChar unless at very end
                searchStart + i + length < pos && // stay in search buffer (or allow overlap if standard LZ77, but standard allows overlap)
                searchBuffer[i + length] === lookaheadBuffer[length]
            ) {
                // Actually LZ77 allows the match to extend into the lookahead buffer!
                // To keep it simple visually, we restrict match to not exceed search buffer boundaries if we want,
                // but standard LZ77 allows length > offset. Let's implement standard overlap.
                length++;
            }
            // Standard overlap logic:
            let matchLen = 0;
            while (
                matchLen < lookaheadBuffer.length &&
                pos + matchLen < inputStr.length &&
                inputStr[searchStart + i + matchLen] === inputStr[pos + matchLen]
            ) {
                matchLen++;
                if (pos + matchLen >= inputStr.length) break; // Reached end of string
            }

            if (matchLen > bestLength && matchLen < lookaheadBuffer.length) { // ensure we have a next_char
                bestLength = matchLen;
                bestOffset = pos - (searchStart + i);
            }
        }
        
        // Handle edge case where match consumes the rest of the string exactly
        // LZ77 always outputs (offset, length, next_char). If we are at the end, next_char might be null.
        let nextChar = '';
        if (pos + bestLength < inputStr.length) {
            nextChar = inputStr[pos + bestLength];
        } else {
            // If the match goes all the way to the end, we need to reduce bestLength by 1 to have a next_char
            if (bestLength > 0) {
                bestLength--;
                bestOffset = bestOffset; // unchanged
                nextChar = inputStr[pos + bestLength];
            } else {
                nextChar = ''; // Should not happen if pos < inputStr.length and bestLength==0
            }
        }

        let tuple = `(${bestOffset}, ${bestLength}, '${nextChar}')`;
        let newOutput = [...output, tuple];

        steps.push({
            pos: pos,
            searchStart: searchStart,
            searchSize: searchSize,
            lookaheadSize: lookaheadSize,
            matchOffset: bestOffset,
            matchLength: bestLength,
            nextChar: nextChar,
            action: bestLength > 0 
                ? `Tìm thấy chuỗi khớp độ dài ${bestLength} cách đây ${bestOffset} ký tự. Ký tự tiếp theo là '${nextChar}'. Xuất ${tuple}.`
                : `Không có chuỗi khớp. Ký tự hiện tại là '${nextChar}'. Xuất (0, 0, '${nextChar}').`,
            currentOutput: newOutput
        });

        output = newOutput;
        pos += bestLength + 1;
    }

    steps.push({
        pos: inputStr.length,
        searchStart: Math.max(0, inputStr.length - searchSize),
        searchSize,
        lookaheadSize,
        matchOffset: 0,
        matchLength: 0,
        nextChar: '',
        action: "🎉 Hoàn tất quá trình mã hóa LZ77!",
        currentOutput: output
    });

    return { steps, output };
};

function LZ77Encode() {
    const [inputText, setInputText] = useState("ABABCBABABCAD");
    const [searchSize, setSearchSize] = useState(8);
    const [lookaheadSize, setLookaheadSize] = useState(6);
    const { steps, output } = useMemo(() => generateLZ77EncodeSteps(inputText, searchSize, lookaheadSize), [inputText, searchSize, lookaheadSize]);

    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1200);

    const currentStepIndex = Math.min(step, Math.max(0, steps.length - 1));
    const currentState = steps[currentStepIndex];
    const isFinished = currentStepIndex === steps.length - 1;

    useEffect(() => {
        setStep(0);
        setIsPlaying(false);
    }, [inputText, searchSize, lookaheadSize]);

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
        return <div className="p-4 text-center">Vui lòng nhập chuỗi ký tự</div>;
    }

    return (
        <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Mô Phỏng Mã Hóa LZ77</h1>
                <p className="text-slate-500 mt-2">Dùng cửa sổ trượt (Sliding Window) gồm <b>Search Buffer</b> (Cửa sổ tìm kiếm) và <b>Lookahead Buffer</b> (Cửa sổ nhìn trước) để tìm chuỗi lặp lại.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="font-semibold text-slate-700">Mô phỏng cửa sổ trượt</span>
                        <span className="text-xs font-mono bg-orange-100 text-orange-800 px-2 py-1 rounded-full border border-orange-200">
                            Bước {currentStepIndex + 1} / {steps.length}
                        </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#fcfdfd] min-h-[300px] overflow-x-auto">
                        <div className="flex flex-nowrap space-x-1 mb-8">
                            {inputText.split('').map((char, idx) => {
                                const isSearch = idx >= currentState.searchStart && idx < currentState.pos;
                                const isLookahead = idx >= currentState.pos && idx < currentState.pos + currentState.lookaheadSize;
                                
                                let matchHighlight = false;
                                if (currentState.matchLength > 0) {
                                    const matchStart = currentState.pos - currentState.matchOffset;
                                    // Highlight in search buffer
                                    if (idx >= matchStart && idx < matchStart + currentState.matchLength) {
                                        matchHighlight = true;
                                    }
                                    // Highlight in lookahead buffer
                                    if (idx >= currentState.pos && idx < currentState.pos + currentState.matchLength) {
                                        matchHighlight = true;
                                    }
                                }

                                const isNextChar = idx === currentState.pos + currentState.matchLength && idx < currentState.pos + currentState.lookaheadSize;

                                let bgClass = "bg-white";
                                let borderClass = "border-slate-200";
                                let textClass = "text-slate-400";

                                if (isSearch) {
                                    bgClass = "bg-blue-50";
                                    borderClass = "border-blue-300";
                                    textClass = "text-blue-800";
                                }
                                if (isLookahead) {
                                    bgClass = "bg-emerald-50";
                                    borderClass = "border-emerald-300";
                                    textClass = "text-emerald-800";
                                }
                                if (matchHighlight) {
                                    bgClass = "bg-orange-500 text-white";
                                    borderClass = "border-orange-600";
                                    textClass = "text-white font-bold";
                                } else if (isNextChar && !isFinished) {
                                    bgClass = "bg-purple-500 text-white";
                                    borderClass = "border-purple-600";
                                    textClass = "text-white font-bold";
                                }

                                return (
                                    <div key={idx} className="flex flex-col items-center">
                                        <div className={`w-10 h-12 flex items-center justify-center text-xl border-2 rounded ${bgClass} ${borderClass} ${textClass} transition-colors duration-300`}>
                                            {char}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1">{idx}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex space-x-6 text-sm font-medium">
                            <div className="flex items-center"><span className="w-4 h-4 bg-blue-50 border border-blue-300 inline-block mr-2"></span> Search Buffer</div>
                            <div className="flex items-center"><span className="w-4 h-4 bg-emerald-50 border border-emerald-300 inline-block mr-2"></span> Lookahead Buffer</div>
                            <div className="flex items-center"><span className="w-4 h-4 bg-orange-500 inline-block mr-2"></span> Khớp (Match)</div>
                            <div className="flex items-center"><span className="w-4 h-4 bg-purple-500 inline-block mr-2"></span> Ký tự tiếp theo</div>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Cấu hình & Đầu vào</label>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:border-orange-500 outline-none mb-3"
                            placeholder="Chuỗi đầu vào..."
                        />
                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label className="text-[10px] text-slate-500 uppercase block mb-1">Search Buffer</label>
                                <input type="number" value={searchSize} onChange={e => setSearchSize(Number(e.target.value))} className="w-full border px-2 py-1 rounded text-sm outline-none" min="1" max="20" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] text-slate-500 uppercase block mb-1">Lookahead Buffer</label>
                                <input type="number" value={lookaheadSize} onChange={e => setLookaheadSize(Number(e.target.value))} className="w-full border px-2 py-1 rounded text-sm outline-none" min="1" max="20" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center min-h-[100px]">
                        <span className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Thao tác ở bước này</span>
                        <p className="text-md font-medium text-slate-800">{currentState.action}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Kết quả xuất ra (Output)</span>
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-sm overflow-y-auto max-h-[150px]">
                            {currentState.currentOutput.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {currentState.currentOutput.map((item, idx) => (
                                        <span key={idx} className="bg-white border border-slate-300 px-2 py-1 rounded shadow-sm text-slate-700 animate-[fadeIn_0.3s_ease-in-out]">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-slate-400">Chưa có kết quả...</span>
                            )}
                        </div>
                    </div>

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
                            <button onClick={reset} title="Khôi phục" className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"><ResetIcon /></button>
                            <button onClick={prevStep} disabled={currentStepIndex === 0} title="Lùi lại" className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors disabled:opacity-50"><PrevIcon /></button>
                            <button onClick={togglePlay} disabled={isFinished} title={isPlaying ? "Tạm dừng" : "Phát"} className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all shadow-md disabled:opacity-50 transform hover:scale-105 active:scale-95">{isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
                            <button onClick={nextStep} disabled={isFinished} title="Tiến tới" className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors disabled:opacity-50"><NextIcon /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const generateLZ77DecodeSteps = (encodedStr) => {
    // Để giải mã, đầu vào thường là danh sách các tuple. 
    // Chúng ta sẽ parse một chuỗi đại diện cho danh sách các tuple: (0,0,'A')(0,0,'B')(2,1,'C')...
    let steps = [];
    let tuples = [];
    
    // Simple parser for "(offset, length, 'char')"
    const regex = /\((\d+),\s*(\d+),\s*'([^']*)'\)/g;
    let match;
    while ((match = regex.exec(encodedStr)) !== null) {
        tuples.push({
            offset: parseInt(match[1]),
            length: parseInt(match[2]),
            char: match[3]
        });
    }

    if (tuples.length === 0) {
        return { steps: [{ action: "Vui lòng nhập chuỗi mã hóa hợp lệ dạng (0,0,'A').", decoded: "" }], finalDecoded: "" };
    }

    let decoded = "";
    
    steps.push({
        tupleIdx: 0,
        decoded: "",
        action: "Bắt đầu giải mã LZ77. Đọc từng bộ ba (Offset, Length, NextChar).",
        highlightTuple: null
    });

    for (let i = 0; i < tuples.length; i++) {
        let t = tuples[i];
        let action = "";
        let newDecoded = decoded;

        if (t.length > 0) {
            let start = newDecoded.length - t.offset;
            let matchedStr = "";
            for (let j = 0; j < t.length; j++) {
                let char = newDecoded[start + j];
                matchedStr += char;
                newDecoded += char; // Cập nhật newDecoded ngay để hỗ trợ Overlap (khi length > offset)
            }
            if (t.char && t.char !== 'null') {
                newDecoded += t.char;
            }
            action = `Đọc (${t.offset}, ${t.length}, '${t.char}'): Quay lại ${t.offset} ký tự, chép ${t.length} ký tự ('${matchedStr}'), thêm '${t.char}'.`;
        } else {
            if (t.char && t.char !== 'null') {
                newDecoded += t.char;
            }
            action = `Đọc (0, 0, '${t.char}'): Thêm ký tự mới '${t.char}'.`;
        }

        steps.push({
            tupleIdx: i + 1,
            decoded: newDecoded,
            action: action,
            highlightTuple: i
        });
        
        decoded = newDecoded;
    }

    steps.push({
        tupleIdx: tuples.length,
        decoded: decoded,
        action: "🎉 Hoàn tất quá trình giải mã LZ77!",
        highlightTuple: null
    });

    return { steps, finalDecoded: decoded, tuples };
};

function LZ77Decode() {
    const [inputText, setInputText] = useState("(0, 0, 'A')(0, 0, 'B')(2, 1, 'C')(4, 3, 'B')(6, 2, 'C')(2, 1, 'D')");
    
    const { steps, tuples } = useMemo(() => generateLZ77DecodeSteps(inputText), [inputText]);

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

    return (
        <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Mô Phỏng Giải Mã LZ77</h1>
                <p className="text-slate-500 mt-2">Dịch ngược các bộ ba <code>(Offset, Length, NextChar)</code> để tái tạo chuỗi ban đầu.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="font-semibold text-slate-700">Chuỗi giải mã</span>
                        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Bước {currentStepIndex + 1} / {steps.length}
                        </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#fcfdfd] min-h-[300px]">
                        <div className="text-4xl font-mono tracking-widest text-emerald-600 font-bold break-all">
                            {currentState?.decoded || <span className="text-slate-200">Đang chờ...</span>}
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Nhập chuỗi đã mã hóa</label>
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:border-blue-500 outline-none h-24 resize-none"
                            placeholder="VD: (0,0,'A')(0,0,'B')..."
                        />
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center min-h-[100px]">
                        <span className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Thao tác ở bước này</span>
                        <p className="text-md font-medium text-slate-800">{currentState?.action}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Tiến trình đọc</span>
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-sm overflow-y-auto max-h-[150px]">
                            {tuples && tuples.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {tuples.map((t, idx) => (
                                        <span key={idx} className={`border px-2 py-1 rounded shadow-sm transition-colors ${currentState?.highlightTuple === idx ? 'bg-orange-500 text-white border-orange-600 font-bold scale-110' : idx < currentState?.tupleIdx ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-white text-slate-500 border-slate-300'}`}>
                                            ({t.offset},{t.length},'{t.char}')
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>

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
                            <button onClick={reset} title="Khôi phục" className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"><ResetIcon /></button>
                            <button onClick={prevStep} disabled={currentStepIndex === 0} title="Lùi lại" className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors disabled:opacity-50"><PrevIcon /></button>
                            <button onClick={togglePlay} disabled={isFinished} title={isPlaying ? "Tạm dừng" : "Phát"} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-md disabled:opacity-50 transform hover:scale-105 active:scale-95">{isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
                            <button onClick={nextStep} disabled={isFinished} title="Tiến tới" className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors disabled:opacity-50"><NextIcon /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
