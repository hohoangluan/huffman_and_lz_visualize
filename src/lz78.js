// ==========================================
// THUẬT TOÁN LZ78
// ==========================================

const generateLZ78EncodeSteps = (inputStr) => {
    let steps = [];
    let dict = {};
    let dictArr = []; // For rendering { index, entry }
    let nextIndex = 1;
    let p = "";
    let output = [];

    if (!inputStr) {
        return { steps: [], output: [] };
    }

    steps.push({
        pos: 0,
        dictArr: [],
        p: "",
        char: "",
        action: "Bắt đầu thuật toán LZ78. Khởi tạo từ điển rỗng.",
        currentOutput: []
    });

    for (let i = 0; i < inputStr.length; i++) {
        let char = inputStr[i];
        let pNext = p + char;

        if (dict[pNext]) {
            p = pNext;
            steps.push({
                pos: i + 1,
                dictArr: [...dictArr],
                p: p,
                char: char,
                action: `Đọc '${char}', chuỗi '${p}' đã có trong từ điển. Tiếp tục đọc ký tự tiếp theo.`,
                currentOutput: [...output]
            });
        } else {
            let prefix = p;
            let idx = prefix === "" ? 0 : dict[prefix];
            
            let newEntry = { index: nextIndex, entry: pNext };
            dict[pNext] = nextIndex;
            dictArr.push(newEntry);
            nextIndex++;

            let tuple = `(${idx}, '${char}')`;
            output.push(tuple);

            steps.push({
                pos: i + 1,
                dictArr: [...dictArr],
                p: "",
                char: char,
                action: `Chuỗi '${pNext}' chưa có trong từ điển. Thêm '${pNext}' vào từ điển tại vị trí ${nextIndex - 1}. Xuất ${tuple}.`,
                currentOutput: [...output]
            });

            p = "";
        }
    }

    if (p !== "") {
        let idx = dict[p];
        let tuple = `(${idx}, '')`;
        output.push(tuple);
        steps.push({
            pos: inputStr.length,
            dictArr: [...dictArr],
            p: "",
            char: "",
            action: `Đã hết chuỗi nhưng còn dư '${p}'. Xuất (${idx}, '').`,
            currentOutput: [...output]
        });
    }

    steps.push({
        pos: inputStr.length,
        dictArr: [...dictArr],
        p: "",
        char: "",
        action: "🎉 Hoàn tất quá trình mã hóa LZ78!",
        currentOutput: [...output]
    });

    return { steps, output };
};

function LZ78Encode() {
    const [inputText, setInputText] = useState("ABABCBABABCAD");
    const { steps, output } = useMemo(() => generateLZ78EncodeSteps(inputText), [inputText]);

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
        return <div className="p-4 text-center">Vui lòng nhập chuỗi ký tự</div>;
    }

    return (
        <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Mô Phỏng Mã Hóa LZ78</h1>
                <p className="text-slate-500 mt-2">Duyệt chuỗi ký tự và xây dựng một <b>Từ điển (Dictionary)</b> các tiền tố đã biết.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <span className="font-semibold text-slate-700">Dữ liệu đang xét</span>
                            <span className="text-xs font-mono bg-orange-100 text-orange-800 px-2 py-1 rounded-full border border-orange-200">
                                Bước {currentStepIndex + 1} / {steps.length}
                            </span>
                        </div>
                        <div className="p-6 bg-[#fcfdfd] flex flex-col items-center">
                            <div className="text-2xl font-mono tracking-widest break-all mb-6">
                                {inputText.split('').map((char, idx) => (
                                    <span key={idx} className={`inline-block transition-colors duration-300 ${idx < currentState.pos ? 'text-slate-300' : idx === currentState.pos ? 'bg-orange-500 text-white font-bold px-1 rounded transform scale-110' : 'text-slate-800'}`}>
                                        {char}
                                    </span>
                                ))}
                            </div>
                            <div className="flex space-x-12">
                                <div className="text-center">
                                    <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Chuỗi khớp (P)</span>
                                    <div className="text-2xl font-mono font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 min-w-[60px] min-h-[50px]">{currentState.p || "\u00A0"}</div>
                                </div>
                                <div className="text-center">
                                    <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Ký tự đọc (C)</span>
                                    <div className="text-2xl font-mono font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 min-w-[60px] min-h-[50px]">{currentState.char || "\u00A0"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">Từ Điển (Dictionary)</div>
                        <div className="p-4 bg-white flex-1 overflow-y-auto max-h-[300px]">
                            {currentState.dictArr.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                                            <th className="py-2 px-4 border-b font-semibold">Chỉ số (Index)</th>
                                            <th className="py-2 px-4 border-b font-semibold">Chuỗi (Entry)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentState.dictArr.map((item, idx) => (
                                            <tr key={idx} className="border-b last:border-0 hover:bg-slate-50 animate-[fadeIn_0.3s_ease-in-out]">
                                                <td className="py-2 px-4 font-mono text-emerald-600 font-bold">{item.index}</td>
                                                <td className="py-2 px-4 font-mono font-bold">{item.entry}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-slate-400 text-center py-8">Từ điển trống</div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Chuỗi đầu vào</label>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:border-orange-500 outline-none"
                            placeholder="Chuỗi đầu vào..."
                        />
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

const generateLZ78DecodeSteps = (encodedStr) => {
    let steps = [];
    let tuples = [];
    
    // Parse "(index, 'char')"
    const regex = /\((\d+),\s*'([^']*)'\)/g;
    let match;
    while ((match = regex.exec(encodedStr)) !== null) {
        tuples.push({
            index: parseInt(match[1]),
            char: match[2]
        });
    }

    if (tuples.length === 0) {
        return { steps: [{ action: "Vui lòng nhập chuỗi mã hóa hợp lệ dạng (0,'A').", decoded: "", dictArr: [] }], finalDecoded: "", tuples: [] };
    }

    let dict = { 0: "" }; // Index 0 is empty string
    let dictArr = [];
    let nextIndex = 1;
    let decoded = "";
    
    steps.push({
        tupleIdx: 0,
        decoded: "",
        dictArr: [],
        action: "Bắt đầu giải mã LZ78. Đọc từng bộ (Index, Char).",
        highlightTuple: null
    });

    for (let i = 0; i < tuples.length; i++) {
        let t = tuples[i];
        
        let prefix = dict[t.index] !== undefined ? dict[t.index] : "";
        let newEntry = prefix + t.char;
        
        decoded += newEntry;
        
        // Cập nhật từ điển nếu có chuỗi mới hợp lệ
        if (newEntry !== "") {
            dict[nextIndex] = newEntry;
            dictArr.push({ index: nextIndex, entry: newEntry });
            nextIndex++;
        }

        steps.push({
            tupleIdx: i + 1,
            decoded: decoded,
            dictArr: [...dictArr],
            action: `Đọc (${t.index}, '${t.char}'): Lấy chuỗi ở vị trí ${t.index} là '${prefix}', ghép với '${t.char}' thành '${newEntry}'. ${newEntry ? `Thêm vào từ điển ở vị trí ${nextIndex - 1}.` : ''}`,
            highlightTuple: i
        });
    }

    steps.push({
        tupleIdx: tuples.length,
        decoded: decoded,
        dictArr: [...dictArr],
        action: "🎉 Hoàn tất quá trình giải mã LZ78!",
        highlightTuple: null
    });

    return { steps, finalDecoded: decoded, tuples };
};

function LZ78Decode() {
    const [inputText, setInputText] = useState("(0, 'A')(0, 'B')(1, 'B')(3, 'C')(2, 'A')(2, 'B')(4, 'A')(0, 'D')");
    
    const { steps, tuples } = useMemo(() => generateLZ78DecodeSteps(inputText), [inputText]);

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
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Mô Phỏng Giải Mã LZ78</h1>
                <p className="text-slate-500 mt-2">Đọc các bộ <code>(Index, Char)</code> để xây dựng lại từ điển và tái tạo chuỗi ban đầu.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <span className="font-semibold text-slate-700">Chuỗi giải mã</span>
                            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Bước {currentStepIndex + 1} / {steps.length}
                            </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#fcfdfd] min-h-[150px]">
                            <div className="text-4xl font-mono tracking-widest text-emerald-600 font-bold break-all">
                                {currentState?.decoded || <span className="text-slate-200">Đang chờ...</span>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">Từ Điển Được Tái Tạo</div>
                        <div className="p-4 bg-white flex-1 overflow-y-auto max-h-[300px]">
                            {currentState?.dictArr && currentState.dictArr.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                                            <th className="py-2 px-4 border-b font-semibold">Chỉ số (Index)</th>
                                            <th className="py-2 px-4 border-b font-semibold">Chuỗi (Entry)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentState.dictArr.map((item, idx) => (
                                            <tr key={idx} className="border-b last:border-0 hover:bg-slate-50 animate-[fadeIn_0.3s_ease-in-out]">
                                                <td className="py-2 px-4 font-mono text-emerald-600 font-bold">{item.index}</td>
                                                <td className="py-2 px-4 font-mono font-bold">{item.entry}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-slate-400 text-center py-8">Từ điển trống</div>
                            )}
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
                            placeholder="VD: (0,'A')(0,'B')..."
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
                                            ({t.index},'{t.char}')
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
