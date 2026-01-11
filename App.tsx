import React, { useState, useRef, useEffect } from 'react';
import { gameBackend } from './services/gameService';
import { Message, GameState } from './types';
import { LEVELS } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    messages: [],
    isThinking: false,
    isCorrect: null,
    hasWon: false,
  });

  const [chatInput, setChatInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [status, setStatus] = useState(gameBackend.getStatus());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.messages, gameState.isThinking]);

  const handleAsk = async () => {
    if (!chatInput.trim() || gameState.isThinking || gameState.hasWon) return;

    const userMsg: Message = {
      role: 'user',
      content: chatInput,
      timestamp: Date.now(),
    };

    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isThinking: true,
    }));
    setChatInput('');

    const response = await gameBackend.ask(chatInput);

    const modelMsg: Message = {
      role: 'model',
      content: response.text,
      timestamp: Date.now(),
    };

    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, modelMsg],
      isThinking: false,
    }));
  };

  const handleSubmitPassword = () => {
    if (!passwordInput.trim() || gameState.hasWon) return;

    const result = gameBackend.submitPassword(passwordInput);
    
    if (result.success) {
      const isComplete = !result.nextLevel;
      setGameState(prev => ({
        ...prev,
        isCorrect: true,
        currentLevel: result.nextLevel || prev.currentLevel,
        messages: [],
        hasWon: isComplete
      }));
      setStatus(gameBackend.getStatus());
      setPasswordInput('');
      
      setTimeout(() => setGameState(prev => ({ ...prev, isCorrect: null })), 3000);
    } else {
      setGameState(prev => ({ ...prev, isCorrect: false }));
      setTimeout(() => setGameState(prev => ({ ...prev, isCorrect: null })), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#000000] text-gray-400 overflow-hidden font-mono selection:bg-blue-900 selection:text-white">
      {/* Brand Header */}
      <header className="border-b border-white/5 px-6 py-4 flex justify-between items-center bg-[#000000]">
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-widest text-white uppercase">
            CLOS PROTOCOL // THE GATEKEEPER
          </h1>
          <a href="https://celayasolutions.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-[0.2em] mt-1">
            Celaya Solutions Research
          </a>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-600 uppercase tracking-tighter mb-0.5">Assessment Phase</div>
          <div className="text-xs font-bold text-white uppercase tabular-nums">
            Level {status.levelNumber} - {status.difficulty} Threat
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Terminal Style Info */}
        <aside className="w-72 border-r border-white/5 p-6 flex flex-col gap-8 hidden lg:flex">
          <section>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-4 tracking-widest border-b border-white/5 pb-2">Target Profile</h3>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-gray-600 uppercase mb-1">Designation</div>
                <div className="text-xs text-white uppercase">{status.levelName}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-600 uppercase mb-1">Mission Specs</div>
                <p className="text-xs leading-relaxed text-gray-400">
                  {status.description}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-4 tracking-widest border-b border-white/5 pb-2">Diagnostic Data</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-600 uppercase">Entropy</span>
                <span className="text-white">0.024%</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-600 uppercase">Latency</span>
                <span className="text-white">12ms</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-600 uppercase">Integrity</span>
                <span className="text-green-500">NOMINAL</span>
              </div>
            </div>
          </section>

          <div className="mt-auto">
            <div className="text-[9px] text-gray-700 leading-normal border-t border-white/5 pt-4">
              CAUTION: ADVERSARIAL ATTEMPTS DETECTED. ALL CONVERSATIONS LOGGED UNDER SECTION 42.
              SUPPORT: hello@celayasolutions.com
            </div>
          </div>
        </aside>

        {/* Chat Interface */}
        <section className="flex-1 flex flex-col bg-[#000000]">
          {gameState.hasWon && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
              <div className="text-center p-12 border border-white/10 bg-black max-w-lg">
                <h2 className="text-2xl font-bold text-white mb-6 tracking-widest uppercase">PROTOCOL CLEARED</h2>
                <p className="text-xs text-gray-400 mb-8 leading-loose uppercase tracking-wide">
                  Cognitive barriers neutralized. All encryption layers bypassed. Final access granted.
                </p>
                <button 
                  onClick={() => {
                    gameBackend.reset();
                    window.location.reload();
                  }}
                  className="px-8 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors uppercase text-[10px] tracking-[0.3em]"
                >
                  Restart Assessment
                </button>
              </div>
            </div>
          )}

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6"
          >
            {gameState.messages.length === 0 && !gameState.isThinking && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-20">
                <div className="text-[10px] uppercase tracking-[0.4em] mb-4">Awaiting Input Signal</div>
                <div className="w-16 h-[1px] bg-white"></div>
              </div>
            )}
            
            {gameState.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] space-y-1`}>
                  <div className={`text-[9px] uppercase font-bold tracking-widest ${
                    msg.role === 'user' ? 'text-right text-gray-600' : 'text-left text-blue-500'
                  }`}>
                    {msg.role === 'user' ? 'INFILTRATOR' : 'SENTINEL'}
                  </div>
                  <div className={`p-4 ${
                    msg.role === 'user' 
                      ? 'bg-white/5 text-gray-200 border-r-2 border-white/20' 
                      : 'bg-blue-900/5 text-gray-300 border-l-2 border-blue-900/50'
                  }`}>
                    <div className="whitespace-pre-wrap text-xs leading-relaxed tracking-wide">{msg.content}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {gameState.isThinking && (
              <div className="flex justify-start">
                <div className="text-gray-700 text-[9px] uppercase tracking-widest animate-pulse">
                  Sentinel analyzing signal...
                </div>
              </div>
            )}
          </div>

          {/* Controller Panel */}
          <div className="border-t border-white/5 bg-[#000000] p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Interaction Field */}
              <div className="md:col-span-2 relative">
                <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2 ml-1">Interrogation Interface</div>
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={gameState.isThinking || gameState.hasWon}
                  placeholder="TRANSMIT MESSAGE..."
                  className="w-full h-28 bg-[#000000] border border-white/10 rounded-none p-4 text-xs focus:outline-none focus:border-white/30 resize-none transition-colors placeholder:text-gray-800 text-white"
                />
                <button
                  onClick={handleAsk}
                  disabled={!chatInput.trim() || gameState.isThinking || gameState.hasWon}
                  className="absolute bottom-4 right-4 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-20 text-white text-[10px] font-bold transition-all uppercase tracking-[0.2em]"
                >
                  Ask
                </button>
              </div>

              {/* Security Key Entry */}
              <div className="flex flex-col gap-4">
                <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-[-8px] ml-1">Access Key Verification</div>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    disabled={gameState.hasWon}
                    placeholder="ENTER SECRET KEY..."
                    className={`w-full bg-[#000000] border rounded-none px-4 py-3 text-xs focus:outline-none transition-all placeholder:text-gray-800 text-white ${
                      gameState.isCorrect === true ? 'border-green-800' :
                      gameState.isCorrect === false ? 'border-red-900 animate-shake' :
                      'border-white/10 focus:border-white/30'
                    }`}
                  />
                  {gameState.isCorrect !== null && (
                    <div className={`absolute -top-6 right-0 text-[9px] font-bold uppercase tracking-widest ${
                      gameState.isCorrect ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {gameState.isCorrect ? 'ACCESS_GRANTED' : 'ACCESS_DENIED'}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSubmitPassword}
                  disabled={!passwordInput.trim() || gameState.hasWon}
                  className="w-full py-3 bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-20 text-[10px] transition-all uppercase tracking-[0.3em]"
                >
                  Submit Key
                </button>
                <div className="text-[8px] text-gray-700 text-center leading-relaxed uppercase tracking-tighter">
                  VERIFY EXTRACTED KEY AGAINST PROTOCOL CORE. 
                  UNAUTHORIZED ATTEMPTS RECORDED.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.1s ease-in-out 0s 3;
        }
      `}</style>
    </div>
  );
};

export default App;