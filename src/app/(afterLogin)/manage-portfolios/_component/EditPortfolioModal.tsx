"use client";

import { useModalStore } from "@/app/store/modal";

export default function EditPortfolioModal() {
    const { setIsEditPortfolioModalOpen } = useModalStore();

    return (
        <>
            <div className="fixed inset-0 bg-black/25 z-[60]"></div>
            <div className="fixed top-[1/8] left-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white rounded-lg shadow-xl p-6 animate-fade-in-down">
                    <div className="pb-4 mb-4 border-b">
                        <div className="flex flex-row justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                포트폴리오 수정
                            </h2>
                            <button
                                className="text-3xl text-slate-300 hover:text-[#3699ff] transition-all"
                                onClick={() =>
                                    setIsEditPortfolioModalOpen(false)
                                }
                            >
                                ×
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col pb-4 mb-4">
                        <label className="text-sm text-slate-700 mb-2">
                            포트폴리오 이름
                        </label>
                        <input
                            type="text"
                            className="p-3 bg-slate-100 text-sm text-slate-700 rounded-md"
                            placeholder="포트폴리오 이름을 입력해주세요."
                        ></input>
                    </div>
                    <div className="flex flex-row justify-end gap-2">
                        <button
                            className="px-6 py-3 bg-[#e1f0ff] hover:bg-[#3699ff] text-sm font-semibold text-[#3699ff] hover:text-white rounded-md transition-all"
                            onClick={() => setIsEditPortfolioModalOpen(false)}
                        >
                            취소
                        </button>
                        <button className="px-6 py-3 bg-[#3699ff] hover:bg-[#187de4] text-sm font-semibold text-white rounded-md transition-all">
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
