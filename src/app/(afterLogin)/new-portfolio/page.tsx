"use client";

import { useState } from "react";

export default function Page() {
  const [portfolioName, setPortfolioName] = useState("");
  const [error, setError] = useState("");

  const handleAddPortfolio = () => {
    if (!portfolioName.trim()) {
      setError("포트폴리오 이름을 입력해주세요.");
    } else {
      setError("");
      // 포트폴리오 추가 로직 실행
    }
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-col w-7/12 bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4">새로운 포트폴리오</h2>
        <div className="flex flex-col mb-4">
          <label className="text-sm text-slate-700 mb-2">포트폴리오 이름</label>
          <input
            type="text"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            className="p-3 bg-slate-100 text-sm text-slate-700 rounded-md"
            placeholder="포트폴리오 이름을 입력해주세요."
          />
          {error && (
            <p className="text-red-500 text-xs mt-1">{error}</p>
          )}
        </div>
        <button
          className="px-6 py-3 bg-[#3699ff] hover:bg-[#187de4] text-sm font-semibold text-white rounded-md transition-all"
          onClick={handleAddPortfolio}
        >
          추가
        </button>
      </div>
    </div>
  );
}