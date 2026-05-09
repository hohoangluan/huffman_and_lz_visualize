// ==========================================
// THUẬT TOÁN LZW
// ==========================================

const generateLZWEncodeSteps = (inputStr, initialAlphabetStr) => {
    let steps = [];
    let dict = {};
    let dictArr = [];
    let nextIndex = 1;
    let p = "";
    let output = [];

    // Lấy các ký tự duy nhất từ chuỗi cấu hình (hoặc từ chính inputStr nếu cấu hình rỗng)
    let alphabet = Array.from(new Set(initialAlphabetStr.split(''))).filter(c => c.trim() !== '');
    if (alphabet.length === 0) {
        alphabet = Array.from(new Set(inputStr.split('')));
    }
    alphabet.sort();

    // Khởi tạo từ điển
    alphabet.forEach(char => {
        dict[char] = nextIndex;
        dictArr.push({ index: nextIndex, entry: char, isInit: true });
        nextIndex++;
    });

    if (!inputStr) {
        return { steps: [{ pos: 0, dictArr, p: "", char: "", action: "Vui lòng nhập chuỗi ký tự.", currentOutput: [] }], output: [] };
    }

    steps.push({
        pos: 0,
        dictArr: [...dictArr],
        p: "",
        char: "",
        action: `Bắt đầu thuật toán LZW. Khởi tạo từ điển với các ký tự cơ sở: ${alphabet.join(', ')}.`,
        currentOutput: []
    });

    p = inputStr[0];
    
    steps.push({
        pos: 1,
        dictArr: [...dictArr],
        p: p,
        char: "",
        action: `Gán P = '${p}'.`,
        currentOutput: []
    });

    for (let i = 1; i < inputStr.length; i++) {
        let char = inputStr[i];
        let pNext = p + char;

        if (dict[pNext]) {
            p = pNext;
            steps.push({
                pos: i + 1,
                dictArr: [...dictArr],
                p: p,
                char: char,
                action: `Đọc C = '${char}'. Chuỗi P+C = '${pNext}' ĐÃ có trong từ điển. Gán P = '${pNext}'.`,
                currentOutput: [...output]
            });
        } else {
            let outCode = dict[p];
            output.push(outCode);
            
            let newEntry = { index: nextIndex, entry: pNext, isInit: false };
            dict[pNext] = nextIndex;
            dictArr.push(newEntry);
            nextIndex++;

            steps.push({
                pos: i + 1,
                dictArr: [...dictArr],
                p: char, // p is updated to char at the end of step, but let's show action first
                char: char,
                action: `Đọc C = '${char}'. Chuỗi P+C = '${pNext}' CHƯA có trong từ điển. Xuất mã của P là ${outCode}. Thêm '${pNext}' vào từ điển. Gán P = '${char}'.`,
                currentOutput: [...output]
            });
            p = char;
        }
    }

    if (p !== "") {
        let outCode = dict[p];
        output.push(outCode);
        steps.push({
            pos: inputStr.length,
            dictArr: [...dictArr],
            p: "",
            char: "",
            action: `Đã hết chuỗi. Xuất mã của P ('${p}') là ${outCode}.`,
            currentOutput: [...output]
        });
    }

    steps.push({
        pos: inputStr.length,
        dictArr: [...dictArr],
        p: "",
        char: "",
        action: "🎉 Hoàn tất quá trình mã hóa LZW!",
        currentOutput: [...output]
    });

    return { steps, output };
};

function LZWEncode() {
    const [inputText, setInputText] = useState("ABABCBABABCAD");
    const [initialAlphabet, setInitialAlphabet] = useState("ABCD");
    
    const { steps, output } = useMemo(() => generateLZWEncodeSteps(inputText, initialAlphabet), [inputText, initialAlphabet]);

    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1200);

    const currentStepIndex = Math.min(step, Math.max(0, steps.length - 1));
    const currentState = steps[currentStepIndex];
    const isFinished = currentStepIndex === steps.length - 1;

    useEffect(() => {
        setStep(0);
        setIsPlaying(false);
    }, [inputText, initialAlphabet]);

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

    if (!currentState) return null;

    return (
        <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Mô Phỏng Mã Hóa LZW</h1>
                <p className="text-slate-500 mt-2">Duyệt chuỗi ký tự và xây dựng <b>Từ điển</b>. Không cần lưu các ký tự đơn vào Output mà chỉ lưu các chỉ số (Index).</p>
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
                                    <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Chuỗi P</span>
                                    <div className="text-2xl font-mono font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 min-w-[60px] min-h-[50px]">{currentState.p || "\u00A0"}</div>
                                </div>
                                <div className="text-center">
                                    <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Ký tự C</span>
                                    <div className="text-2xl font-mono font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 min-w-[60px] min-h-[50px]">{currentState.char || "\u00A0"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">Từ Điển LZW</div>
                        <div className="p-4 bg-white flex-1 overflow-y-auto max-h-[300px]">
                            {currentState.dictArr.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                                            <th className="py-2 px-4 border-b font-semibold w-24">Chỉ số</th>
                                            <th className="py-2 px-4 border-b font-semibold">Chuỗi</th>
                                            <th className="py-2 px-4 border-b font-semibold text-right">Loại</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentState.dictArr.map((item, idx) => (
                                            <tr key={idx} className="border-b last:border-0 hover:bg-slate-50 animate-[fadeIn_0.3s_ease-in-out]">
                                                <td className="py-2 px-4 font-mono text-emerald-600 font-bold">{item.index}</td>
                                                <td className="py-2 px-4 font-mono font-bold">{item.entry}</td>
                                                <td className="py-2 px-4 text-right text-xs">
                                                    {item.isInit ? 
                                                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded">Cơ sở</span> : 
                                                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Thêm mới</span>}
                                                </td>
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
                        <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Cấu hình & Đầu vào</label>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:border-orange-500 outline-none mb-3"
                            placeholder="Chuỗi đầu vào..."
                        />
                        <label className="text-[10px] text-slate-500 uppercase block mb-1">Từ điển cơ sở (các ký tự đơn)</label>
                        <input 
                            type="text" 
                            value={initialAlphabet}
                            onChange={(e) => setInitialAlphabet(e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-sm font-mono focus:border-blue-500 outline-none"
                            placeholder="VD: ABCD"
                        />
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center min-h-[120px]">
                        <span className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Thao tác ở bước này</span>
                        <p className="text-md font-medium text-slate-800 leading-relaxed">{currentState.action}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Kết quả xuất ra (Các mã Index)</span>
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-lg overflow-y-auto max-h-[150px]">
                            {currentState.currentOutput.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {currentState.currentOutput.map((item, idx) => (
                                        <span key={idx} className="bg-emerald-500 text-white font-bold border border-emerald-600 px-3 py-1 rounded shadow-sm animate-[fadeIn_0.3s_ease-in-out]">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-slate-400 text-sm">Chưa có kết quả...</span>
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

const generateLZWDecodeSteps = (encodedStr, initialAlphabetStr) => {
    let steps = [];
    let codes = encodedStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    
    let dict = {};
    let dictArr = [];
    let nextIndex = 1;
    let decoded = "";

    // Khởi tạo từ điển
    let alphabet = Array.from(new Set(initialAlphabetStr.split(''))).filter(c => c.trim() !== '');
    alphabet.sort();
    
    alphabet.forEach(char => {
        dict[nextIndex] = char;
        dictArr.push({ index: nextIndex, entry: char, isInit: true });
        nextIndex++;
    });

    if (codes.length === 0) {
        return { steps: [{ action: "Vui lòng nhập mảng mã (VD: 1, 2, 4...).", decoded: "", dictArr }], finalDecoded: "", codes: [] };
    }

    steps.push({
        codeIdx: 0,
        decoded: "",
        dictArr: [...dictArr],
        action: `Bắt đầu giải mã LZW. Khởi tạo từ điển với các ký tự cơ sở.`,
        highlightCode: null
    });

    let oldCode = codes[0];
    let s = dict[oldCode];
    if (s === undefined) {
        return { steps: [{ action: `Lỗi: Mã đầu tiên ${oldCode} không có trong từ điển cơ sở!`, decoded: "", dictArr }], finalDecoded: "", codes };
    }
    
    decoded += s;
    steps.push({
        codeIdx: 1,
        decoded: decoded,
        dictArr: [...dictArr],
        action: `Đọc mã đầu tiên ${oldCode}, tra từ điển được chuỗi '${s}'. Xuất '${s}'. OLD_CODE = ${oldCode}.`,
        highlightCode: 0
    });

    let c = s[0];

    for (let i = 1; i < codes.length; i++) {
        let code = codes[i];
        let action = "";

        if (dict[code] !== undefined) {
            s = dict[code];
            action = `Đọc mã ${code}, tra từ điển được '${s}'. Xuất '${s}'. Thêm '${dict[oldCode] + s[0]}' vào từ điển. OLD_CODE = ${code}.`;
        } else {
            s = dict[oldCode] + c;
            action = `Đọc mã ${code} CHƯA có trong từ điển (trường hợp cSc). Chuỗi tạo thành là '${s}'. Xuất '${s}'. Thêm '${s}' vào từ điển. OLD_CODE = ${code}.`;
        }
        
        decoded += s;
        c = s[0];
        
        // Cập nhật từ điển
        let newEntry = dict[oldCode] + c;
        dict[nextIndex] = newEntry;
        dictArr.push({ index: nextIndex, entry: newEntry, isInit: false });
        nextIndex++;
        
        oldCode = code;

        steps.push({
            codeIdx: i + 1,
            decoded: decoded,
            dictArr: [...dictArr],
            action: action,
            highlightCode: i
        });
    }

    steps.push({
        codeIdx: codes.length,
        decoded: decoded,
        dictArr: [...dictArr],
        action: "🎉 Hoàn tất quá trình giải mã LZW!",
        highlightCode: null
    });

    return { steps, finalDecoded: decoded, codes };
};

function LZWDecode() {
    const [inputText, setInputText] = useState("1, 2, 1, 2, 3, 2, 1, 2, 5, 3, 1, 4");
    const [initialAlphabet, setInitialAlphabet] = useState("ABCD");
    
    const { steps, codes } = useMemo(() => generateLZWDecodeSteps(inputText, initialAlphabet), [inputText, initialAlphabet]);

    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1200);

    const currentStepIndex = Math.min(step, Math.max(0, steps.length - 1));
    const currentState = steps[currentStepIndex];
    const isFinished = currentStepIndex === steps.length - 1;

    useEffect(() => {
        setStep(0);
        setIsPlaying(false);
    }, [inputText, initialAlphabet]);

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
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Mô Phỏng Giải Mã LZW</h1>
                <p className="text-slate-500 mt-2">Dịch ngược các mã Index. Cần phải có <b>Từ điển cơ sở</b> giống hệt như lúc mã hóa.</p>
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
                        <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">Từ Điển LZW Được Tái Tạo</div>
                        <div className="p-4 bg-white flex-1 overflow-y-auto max-h-[300px]">
                            {currentState?.dictArr && currentState.dictArr.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                                            <th className="py-2 px-4 border-b font-semibold w-24">Chỉ số</th>
                                            <th className="py-2 px-4 border-b font-semibold">Chuỗi</th>
                                            <th className="py-2 px-4 border-b font-semibold text-right">Loại</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentState.dictArr.map((item, idx) => (
                                            <tr key={idx} className="border-b last:border-0 hover:bg-slate-50 animate-[fadeIn_0.3s_ease-in-out]">
                                                <td className="py-2 px-4 font-mono text-emerald-600 font-bold">{item.index}</td>
                                                <td className="py-2 px-4 font-mono font-bold">{item.entry}</td>
                                                <td className="py-2 px-4 text-right text-xs">
                                                    {item.isInit ? 
                                                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded">Cơ sở</span> : 
                                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Thêm mới</span>}
                                                </td>
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
                        <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Cấu hình & Đầu vào</label>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:border-blue-500 outline-none mb-3"
                            placeholder="VD: 1, 2, 4..."
                        />
                        <label className="text-[10px] text-slate-500 uppercase block mb-1">Từ điển cơ sở (các ký tự đơn)</label>
                        <input 
                            type="text" 
                            value={initialAlphabet}
                            onChange={(e) => setInitialAlphabet(e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-sm font-mono focus:border-blue-500 outline-none"
                            placeholder="VD: ABCD"
                        />
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center min-h-[120px]">
                        <span className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Thao tác ở bước này</span>
                        <p className="text-md font-medium text-slate-800 leading-relaxed">{currentState?.action}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Tiến trình đọc mã</span>
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-sm overflow-y-auto max-h-[150px]">
                            {codes && codes.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {codes.map((c, idx) => (
                                        <span key={idx} className={`border px-2 py-1 rounded shadow-sm transition-colors ${currentState?.highlightCode === idx ? 'bg-blue-500 text-white border-blue-600 font-bold scale-110' : idx < currentState?.codeIdx ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-white text-slate-500 border-slate-300'}`}>
                                            {c}
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
