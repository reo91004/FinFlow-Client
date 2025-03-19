'use client';

import { useModalStore } from '@/app/store/modal';
import axiosInstance from '@/utils/axiosInstance';
import Swal from 'sweetalert2';
import { Trash2 } from 'lucide-react';

interface DeleteTransactionsModalProps {
  selectedItems: number[];
  onDeletionSuccess: () => void;
}

export default function DeleteTransactionsModal({
  selectedItems,
  onDeletionSuccess,
}: DeleteTransactionsModalProps) {
  const { setIsTransactionsDeleteModalOpen } = useModalStore();

  const handleConfirmDelete = async () => {
    try {
      // DELETE 요청 시 body에 삭제할 거래 ID 배열을 전송
      await axiosInstance.delete('/transactions', {
        data: selectedItems,
      });
      Swal.fire({
        title: '삭제 성공!',
        text: '선택한 거래 내역이 삭제되었습니다.',
        icon: 'success',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });
      // 삭제 성공 후 콜백 호출하여 거래 내역 새로 불러오기 등 처리
      onDeletionSuccess();
      setIsTransactionsDeleteModalOpen(false);
    } catch (error: any) {
      console.error('삭제 실패:', error);
      Swal.fire({
        title: '오류 발생',
        text: error.response?.data?.detail || '삭제 중 문제가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/25 z-[60]"></div>
      <div className="fixed top-[12%] left-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white rounded-lg shadow-xl p-6 animate-fade-in-down">
          <div className="pb-4 mb-4 border-b">
            <div className="flex flex-row justify-between items-center">
              <h2 className="text-xl font-semibold">거래 내역 삭제</h2>
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
            <button
              className="px-6 py-3 bg-red-400 hover:bg-red-500 text-sm font-semibold text-white rounded-md transition-all"
              onClick={handleConfirmDelete}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              삭제
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
