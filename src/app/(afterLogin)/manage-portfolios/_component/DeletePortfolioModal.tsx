// src/app/(afterLogin)/manage-portfolios/_component/DeletePortfolioModal.tsx
'use client';

import { useState } from 'react';
import { useModalStore } from '@/app/store/modal';
import axiosInstance from '@/utils/axiosInstance';
import Swal from 'sweetalert2';

// Props 타입 정의
interface DeletePortfolioModalProps {
  portfolioId: number | null; // null도 허용하여 선택된 포트폴리오가 없을 경우 대비
  onSuccess?: () => void; // 성공 콜백 함수는 옵션
}

export default function DeletePortfolioModal({
  portfolioId,
  onSuccess,
}: DeletePortfolioModalProps) {
  const { setIsDeletePortfolioModalOpen } = useModalStore();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!portfolioId) {
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.delete(`/portfolio/${portfolioId}`);

      setIsDeletePortfolioModalOpen(false);

      await Swal.fire({
        title: '포트폴리오가 삭제되었습니다!',
        icon: 'success',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });

      // 삭제 성공 후 콜백 함수 실행 (목록 새로고침 등)
      if (onSuccess) onSuccess();
    } catch (error) {
      Swal.fire({
        title: '포트폴리오 삭제 중 오류가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='fixed inset-0 bg-black/25 z-[60]'></div>
      <div className='fixed top-1/4 left-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2'>
        <div className='bg-white rounded-lg shadow-xl p-6 animate-fade-in-down'>
          <div className='pb-4 mb-4 border-b'>
            <div className='flex flex-row justify-between items-center'>
              <h2 className='text-xl font-semibold'>포트폴리오 삭제</h2>
              <button
                className='text-3xl text-slate-300 hover:text-[#3699ff] transition-all'
                onClick={() => setIsDeletePortfolioModalOpen(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
          </div>
          <div className='pb-4 mb-4 text-sm text-slate-700'>
            정말 해당 포트폴리오를 삭제하시겠습니까?
          </div>
          <div className='flex flex-row justify-end gap-2'>
            <button
              className='px-6 py-3 bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-500 rounded-md transition-all'
              onClick={() => setIsDeletePortfolioModalOpen(false)}
              disabled={loading}
            >
              취소
            </button>
            <button
              className='px-6 py-3 bg-red-400 hover:bg-red-500 text-sm font-semibold text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
