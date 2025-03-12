'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { usePortfolioStore } from '@/app/store/usePortfolioStore';

export default function Page() {
  const [portfolioName, setPortfolioName] = useState('');
  const router = useRouter();

  // Zustand 스토어에서 필요한 상태와 액션 가져오기
  const { addPortfolio, isLoading, error } = usePortfolioStore();

  const handleAddPortfolio = async () => {
    if (!portfolioName.trim()) {
      Swal.fire({
        title: '오류',
        text: '포트폴리오 이름을 입력해주세요.',
        icon: 'error',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });
      return;
    }

    // 스토어의 addPortfolio 액션 사용
    const success = await addPortfolio(portfolioName);

    if (success) {
      await Swal.fire({
        title: '포트폴리오가 생성되었습니다!',
        text: `"${portfolioName}" 포트폴리오가 성공적으로 추가되었습니다.`,
        icon: 'success',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });

      // 포트폴리오 관리 페이지로 이동
      router.push('/manage-portfolios');
    } else {
      // 에러 메시지 표시
      await Swal.fire({
        title: '오류',
        text: error || '포트폴리오 생성 중 오류가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });
    }
  };

  return (
    <div className='flex justify-center'>
      <div className='flex flex-col w-full md:w-8/12 lg:w-7/12 bg-white rounded-lg shadow-xl p-6'>
        <h2 className='text-xl font-semibold mb-4'>새로운 포트폴리오</h2>
        <div className='flex flex-col mb-4'>
          <label className='text-sm text-slate-700 mb-2'>포트폴리오 이름</label>
          <input
            type='text'
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) handleAddPortfolio();
            }}
            className='p-3 bg-slate-100 text-sm text-slate-700 rounded-md'
            placeholder='포트폴리오 이름을 입력해주세요.'
            disabled={isLoading}
          />
          {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
        </div>
        <div className='flex flex-row gap-2 justify-end'>
          <button
            className='px-6 py-3 bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-500 rounded-md transition-all'
            onClick={() => router.push('/manage-portfolios')}
            disabled={isLoading}
          >
            취소
          </button>
          <button
            className='px-6 py-3 bg-[#3699ff] hover:bg-[#187de4] text-sm font-semibold text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handleAddPortfolio}
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
