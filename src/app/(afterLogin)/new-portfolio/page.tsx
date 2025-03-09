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
      // 로컬스토리지에서 사용자 ID 가져오기
      const uid =
        localStorage.getItem('uid') ||
        JSON.parse(localStorage.getItem('user_info') || '{}').uid;

      if (!uid) {
        setError('로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        setLoading(false);
        return;
      }

      // 서버에서 필요로 하는 형식으로 데이터 구성
      const portfolioData = {
        portfolio_name: portfolioName,
      };

      // 백엔드 API 호출 - user_id를 쿼리 파라미터로 전달
      const response = await axiosInstance.post(
        `/portfolio?user_id=${uid}`,
        portfolioData
      );

      if (response.data) {
        await Swal.fire({
          title: '포트폴리오가 생성되었습니다!',
          text: `"${portfolioName}" 포트폴리오가 성공적으로 추가되었습니다.`,
          icon: 'success',
          confirmButtonText: '확인',
          confirmButtonColor: '#3699ff',
        });
        // 포트폴리오 관리 페이지로 이동
        router.push('/manage-portfolios');
      }
    } catch (error: any) {
      console.error('API 에러:', error);

      // 더 자세한 에러 정보 표시
      if (error.response) {
        // 서버 응답이 있는 경우
        console.error('응답 데이터:', error.response.data);
        console.error('응답 상태:', error.response.status);

        if (error.response.status === 422) {
          setError(
            '데이터 형식이 올바르지 않습니다. 포트폴리오 이름을 확인해주세요.'
          );
        } else if (error.response.status === 400) {
          setError('이미 존재하는 포트폴리오 이름입니다.');
        } else {
          setError(
            `서버 오류: ${error.response.data.detail || '알 수 없는 오류'}`
          );
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        setError('서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        // 요청 설정 중 에러 발생
        setError(`오류: ${error.message}`);
      }
    } finally {
      setLoading(false);
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
              if (e.key === 'Enter') handleAddPortfolio();
            }}
            className='p-3 bg-slate-100 text-sm text-slate-700 rounded-md'
            placeholder='포트폴리오 이름을 입력해주세요.'
          />
          {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
        </div>
        <div className='flex flex-row gap-2 justify-end'>
          <button
            className='px-6 py-3 bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-500 rounded-md transition-all'
            onClick={() => router.push('/manage-portfolios')}
            disabled={loading}
          >
            취소
          </button>
          <button
            className='px-6 py-3 bg-[#3699ff] hover:bg-[#187de4] text-sm font-semibold text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handleAddPortfolio}
            disabled={loading}
          >
            {loading ? '처리 중...' : '추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
