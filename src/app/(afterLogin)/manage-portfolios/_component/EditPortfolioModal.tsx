'use client';

import { useState, useEffect } from 'react';
import { useModalStore } from '@/app/store/modal';
import axiosInstance from '@/utils/axiosInstance';
import Swal from 'sweetalert2';

// Portfolio 타입 정의 (필요한 속성만 포함)
interface Portfolio {
  portfolio_id: number;
  portfolio_name: string;
  user_id?: number;
}

// Props 타입 정의
interface EditPortfolioModalProps {
  portfolio: Portfolio | null;
  onSuccess?: () => void;
}

export default function EditPortfolioModal({
  portfolio,
  onSuccess,
}: EditPortfolioModalProps) {
  const { setIsEditPortfolioModalOpen } = useModalStore();
  const [portfolioName, setPortfolioName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (portfolio) {
      setPortfolioName(portfolio.portfolio_name);
    }
  }, [portfolio]);

  const handleSave = async () => {
    if (!portfolioName.trim()) {
      setError('포트폴리오 이름을 입력해주세요.');
      return;
    }

    // portfolio가 null인 경우 처리
    if (!portfolio) {
      setError('포트폴리오 정보가 없습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 백엔드 API 호출
      await axiosInstance.patch(`/portfolio/${portfolio.portfolio_id}`, {
        portfolio_name: portfolioName,
      });

      setIsEditPortfolioModalOpen(false);

      await Swal.fire({
        title: '포트폴리오가 수정되었습니다!',
        icon: 'success',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });

      // 성공 콜백 실행
      if (onSuccess) onSuccess();
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError('이미 존재하는 포트폴리오 이름입니다.');
      } else {
        setError('포트폴리오 수정 중 오류가 발생했습니다.');
      }
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
              <h2 className='text-xl font-semibold'>포트폴리오 수정</h2>
              <button
                className='text-3xl text-slate-300 hover:text-[#3699ff] transition-all'
                onClick={() => setIsEditPortfolioModalOpen(false)}
              >
                ×
              </button>
            </div>
          </div>
          <div className='flex flex-col pb-4 mb-4'>
            <label className='text-sm text-slate-700 mb-2'>
              포트폴리오 이름
            </label>
            <input
              type='text'
              className='p-3 bg-slate-100 text-sm text-slate-700 rounded-md'
              placeholder='포트폴리오 이름을 입력해주세요.'
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
            />
            {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
          </div>
          <div className='flex flex-row justify-end gap-2'>
            <button
              className='px-6 py-3 bg-[#e1f0ff] hover:bg-[#3699ff] text-sm font-semibold text-[#3699ff] hover:text-white rounded-md transition-all'
              onClick={() => setIsEditPortfolioModalOpen(false)}
              disabled={loading}
            >
              취소
            </button>
            <button
              className='px-6 py-3 bg-[#3699ff] hover:bg-[#187de4] text-sm font-semibold text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleSave}
              disabled={loading || !portfolio}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
