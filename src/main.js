// ==========================================
// MAIN APP
// ==========================================

function App() {
    const [activeAlgo, setActiveAlgo] = useState('huffman');
    const [activeMode, setActiveMode] = useState('encode');

    const renderContent = () => {
        if (activeAlgo === 'huffman') {
            return activeMode === 'encode' ? <HuffmanBuilder /> : <HuffmanAnimation />;
        }
        if (activeAlgo === 'lz77') {
            return activeMode === 'encode' ? <LZ77Encode /> : <LZ77Decode />;
        }
        if (activeAlgo === 'lz78') {
            return activeMode === 'encode' ? <LZ78Encode /> : <LZ78Decode />;
        }
        if (activeAlgo === 'lzw') {
            return activeMode === 'encode' ? <LZWEncode /> : <LZWDecode />;
        }
        return null;
    };

    return (
        <div className="font-sans pb-10">
            {/* Top Navigation - Algorithms */}
            <div className="bg-slate-900 text-white py-4 shadow-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-xl font-bold tracking-wider text-orange-400">
                        COMPRESSION<span className="text-white">DEMO</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        {['huffman', 'lz77', 'lz78', 'lzw'].map(algo => (
                            <button 
                                key={algo}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all uppercase tracking-wider ${activeAlgo === algo ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                onClick={() => setActiveAlgo(algo)}
                            >
                                {algo}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto pt-8 px-4 md:px-8">
                {/* Second-level Navigation - Mode */}
                <div className="flex justify-center space-x-4 mb-8">
                    <button 
                        className={`px-6 py-2.5 rounded-full font-bold text-md transition-all ${activeMode === 'encode' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                        onClick={() => setActiveMode('encode')}
                    >
                        Thuật toán Mã hóa (Encode)
                    </button>
                    <button 
                        className={`px-6 py-2.5 rounded-full font-bold text-md transition-all ${activeMode === 'decode' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                        onClick={() => setActiveMode('decode')}
                    >
                        Thuật toán Giải mã (Decode)
                    </button>
                </div>

                {/* Main Content */}
                <div className="animate-[fadeIn_0.3s_ease-in-out]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
