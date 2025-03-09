'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import Swal from 'sweetalert2';

export default function Page() {
  const [portfolioName, setPortfolioName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddPortfolio = async () => {
    if (!portfolioName.trim()) {
      setError('포트폴리오 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uid =
        localStorage.getItem('uid') ||
        JSON.parse(localStorage.getItem('user_info') || '{}').uid;
      if (!uid) {
        setError('로그인 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      const response = await axiosInstance.post('/portfolio', {
        user_id: parseInt(uid),
        portfolio_name: portfolioName,
      });

      if (response.data) {
        await Swal.fire({
          title: '포트폴리오가 생성되었습니다!',
          icon: 'success',
          confirmButtonText: '확인',
          confirmButtonColor: '#3699ff',
        });
        router.push('/manage-portfolios');
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError('이미 존재하는 포트폴리오 이름입니다.');
      } else {
        setError('포트폴리오 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-center'>
      <div className='flex flex-col w-7/12 bg-white rounded-lg shadow-xl p-6'>
        <h2 className='text-xl font-semibold mb-4'>새로운 포트폴리오</h2>
        <div className='flex flex-col mb-4'>
          <label className='text-sm text-slate-700 mb-2'>포트폴리오 이름</label>
          <input
            type='text'
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            className='p-3 bg-slate-100 text-sm text-slate-700 rounded-md'
            placeholder='포트폴리오 이름을 입력해주세요.'
          />
          {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
        </div>
        <button
          className='px-6 py-3 bg-[#3699ff] hover:bg-[#187de4] text-sm font-semibold text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          onClick={handleAddPortfolio}
          disabled={loading}
        >
          {loading ? '처리 중...' : '추가'}
        </button>
      </div>
    </div>
  );
}
