import { useModalStore } from '@/app/store/modal';

export default function DeleteTransactionsModal() {
    const { setIsTransactionsDeleteModalOpen } = useModalStore();

    return (
        <>
            <div className="fixed inset-0 bg-black/25 z-[60]"></div>
            <div className="fixed top-[1/8] left-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white rounded-lg shadow-xl p-6 animate-fade-in-down">
                    <div className="pb-4 mb-4 border-b">
                        <div className="flex flex-row justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                거래 내역 삭제
                            </h2>
                            <button
                                className="text-3xl text-slate-300 hover:text-[#3699ff] transition-all"
                                onClick={() => setIsTransactionsDeleteModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                    <div className="pb-4 mb-4 text-sm text-slate-700">
                        정말 해당 거래 내역을 삭제하시겠습니까?
                    </div>
                    <div className="flex flex-row justify-end gap-2">
                        <button
                            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-500 rounded-md transition-all"
                            onClick={() => setIsTransactionsDeleteModalOpen(false)}
                        >
                            취소
                        </button>
                        <button className="px-6 py-3 bg-red-400 hover:bg-red-500 text-sm font-semibold text-white rounded-md transition-all">
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}