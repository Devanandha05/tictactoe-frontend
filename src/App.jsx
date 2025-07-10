import { useEffect, useState } from 'react';
import { User2, Users2 } from "lucide-react";
import { Smile, Flame } from "lucide-react";
import axios from 'axios';

const API_BASE = "http://localhost:5000";

function App() {
  const [board, setBoard] = useState(Array(16).fill(""));
  const [mode, setMode] = useState("single")
  const [difficulty, setDifficulty] = useState("easy")
  const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null)
  const [draw, setDraw] = useState(false);

  const changeMode = (mode) => {
    setMode(mode);
  }

  const fetchGameState = async () => {
    const res = await axios.get(`${API_BASE}/game-state`);
    const newBoard = res.data.board;
  
    setBoard(newBoard);
    setTurn(res.data.current_turn);
    setWinner(res.data.winner);
    setDraw(res.data.draw);
  
    const line = getWinningLine(newBoard); // ✅ use updated board
    setWinningLine(line);
  };
  
  const changeDifficulty = (difficulty) => {
   setDifficulty(difficulty);
  }

  const startNewGame = async () => {
    await axios.post(`${API_BASE}/start`);
    await fetchGameState();
    setWinningLine(null); // 🔄 optional, but ensures visual reset
  };
  

  const handleMove = async (index) => {
    if (board[index] || winner || draw) return;
    await axios.post(`${API_BASE}/make-move`, { position: index });

    if (mode === 'single') {
      const res = await axios.post(`${API_BASE}/make-ai-move`, { difficulty });
    }

    // Then fetch only once
    await fetchGameState();
  };

  const winConditions = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12],
  ];

  function getWinningLine(board) {
    for (const [a, b, c, d] of winConditions) {
      if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] === board[d]){
        return [a, b, c, d];  // winning indexes
      }
    }
      return null;
    }

  const getStrikeClass = (line) => {
    const map = {
      // Horizontal Rows
      "0,1,2,3": "left-[7%] top-[12.5%] rotate-0",     // Row 1
      "4,5,6,7": "left-[7%] top-[38%] rotate-0",       // Row 2
      "8,9,10,11": " left-[7%] top-[62.5%] rotate-0",   // Row 3
      "12,13,14,15": "left-[7%] top-[88%] rotate-0",   // Row 4
    
      // Vertical Columns
      "0,4,8,12": "top-[7%] left-[-77.5%] rotate-[90deg] origin-center w-[88%]",
      "1,5,9,13": "top-[7%] left-[-52.5%] rotate-[90deg] origin-center w-[88%]",
      "2,6,10,14": "top-[7%] left-[-27.5%] rotate-[90deg] origin-center w-[88%]",
      "3,7,11,15": "top-[7%] left-[-2.5%] rotate-[90deg] origin-center w-[88%]", // fixed here

      // Diagonals
      "0,5,10,15": "top-[66%] left-[42%] -translate-x-1/2 -translate-y-1/2 rotate-45 origin-center w-[141%]",
      "3,6,9,12": "top-[60%] left-[68%] -translate-x-1/2 -translate-y-1/2 -rotate-45 origin-center w-[141%]",   // Diagonal /
    };
    
    return map[line.toString()] || "";
  };
  
  useEffect(() => {
    fetchGameState();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#1A1A1A] p-4">
      <h1 className="text-3xl font-bold mb-6">Tic-Tac-Toe</h1>
  
      {/* Game Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
  
        {/* Mode Selector */}
        <div className="flex justify-center items-center gap-4 bg-white/5 border border-white/10 rounded-lg p-2 shadow-md">
          {/* Single */}
          <div className="relative group inline-block">
            <button
              onClick={() => changeMode('single')}
              disabled={winner || draw}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                mode === 'single'
                  ? 'bg-pink-600 text-white shadow-inner'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <User2 size={20} />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-md z-10">
              Singleplayer
            </div>
          </div>
  
          {/* Multi */}
          <div className="relative group inline-block">
            <button
              onClick={() => changeMode('multi')}
              disabled={winner || draw}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                mode === 'multi'
                  ? 'bg-pink-600 text-white shadow-inner'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Users2 size={20} />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-md z-10">
              Multiplayer
            </div>
          </div>
        </div>
  
        {/* Difficulty Selector */}
        {mode === 'single' && (
          <div className="flex gap-4 items-center bg-white/5 border border-white/10 rounded-lg p-2 shadow-md">
            <div className="relative group inline-block">
              <button
                onClick={() => changeDifficulty('easy')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all duration-200 ${
                  difficulty === 'easy'
                    ? 'bg-green-600 text-white shadow-inner'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <Smile size={18} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-md z-10">
                Easy
              </div>
            </div>
  
            <div className="relative group inline-block">
              <button
                onClick={() => changeDifficulty('hard')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all duration-200 ${
                  difficulty === 'hard'
                    ? 'bg-pink-600 text-white shadow-inner'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <Flame size={18} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-md z-10">
                Hard
              </div>
            </div>
          </div>
        )}
      </div>
  
      {/* Game Board */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-0 shadow-[0_0_20px_4px_rgba(255,255,255,0.05)] rounded-xl">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleMove(index)}
              className={`w-20 h-20 text-4xl font-bold
                ${index % 4 !== 3 ? 'border-r-2' : ''}
                ${index < 12 ? 'border-b-2' : ''}
                border-gray-600/40
                ${cell === 'X' ? 'text-glow-X text-[#32FF6A]' : cell === 'O' ? 'text-glow-O text-[#efd1d6]' : 'text-black'}`}
            >
              {cell}
            </button>
          ))}
        </div>
  
        {/* Strike Line */}
        {winningLine && (
          <div className={`absolute inset-0 pointer-events-none ${getStrikeClass(winningLine)}`}>
            <div className="absolute bg-white rounded-lg h-1 w-11/12 transform transition-all duration-500 shadow-[0_0_4px_1px_#FF4A6E] animate-pulse" />
          </div>
        )}
      </div>
  
      {/* Game Status */}
      <div className="mt-6 text-lg">
        {winner ? (
          <p className="text-white font-bold"
            >
              🎉 Player <span className={`${winner === 'X' ? 'text-glow-X text-[#32FF6A]' : 'text-glow-O text-[#efd1d6]'}`}>{winner}</span> wins!</p>
        ) : draw ? (
          <p className="text-[#9D0191] font-bold">It's a draw!</p>
        ) : (
          <p>
            Current Turn:{' '}
            <span className={`font-bold ${turn === 'X' ? 'text-[#32FF6A]' : 'text-[#FF4A6E]'}`}>
              {turn}
            </span>
          </p>
        )}
      </div>
  
      {/* New Game Button */}
      <button
        onClick={startNewGame}
        className="mt-4 px-4 py-2 bg-pink-700 text-white rounded hover:bg-pink-900"
      >
        New Game!
      </button>
  
      {/* Footer */}
      <footer className="mt-12 text-center text-gray-400 text-xs font-mono tracking-wide">
        🩷 Crafted by <span className="text-green-500">Devanandha S</span>
      </footer>
    </div>
  );
}

export default App;