'use client';

import { useEffect, useState } from 'react';
import { useModalStore } from '@/app/store/modal';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Trash2 } from 'lucide-react';
import EditPortfolioModal from './_component/EditPortfolioModal';
import DeletePortfolioModal from './_component/DeletePortfolioModal';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import Swal from 'sweetalert2';

interface Portfolio {
  portfolio_id: number;
  portfolio_name: string;
  user_id: number;
}

export default function Page() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    isEditPortfolioModalOpen,
    setIsEditPortfolioModalOpen,
    isDeletePortfolioModalOpen,
    setIsDeletePortfolioModalOpen,
  } = useModalStore();

  // 포트폴리오 목록 불러오기
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        setError(null);

        // 로컬스토리지에서 사용자 ID 가져오기
        const uid =
          localStorage.getItem('uid') ||
          JSON.parse(localStorage.getItem('user_info') || '{}').uid;

        if (!uid) {
          setError('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
          setLoading(false);
          return;
        }

        // 백엔드 API 호출
        const response = await axiosInstance.get(`/portfolio?user_id=${uid}`);
        setPortfolios(response.data);
      } catch (error) {
        console.error('포트폴리오 불러오기 에러:', error);
        setError('포트폴리오를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const handleEdit = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsEditPortfolioModalOpen(true);
  };

  const handleDelete = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsDeletePortfolioModalOpen(true);
  };

  const handleSuccessfulUpdate = async () => {
    // 포트폴리오 목록 새로고침
    try {
      setLoading(true);
      const uid =
        localStorage.getItem('uid') ||
        JSON.parse(localStorage.getItem('user_info') || '{}').uid;

      if (!uid) {
        setError('사용자 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(`/portfolio?user_id=${uid}`);
      setPortfolios(response.data);
    } catch (error) {
      console.error('포트폴리오 목록 새로고침 오류:', error);
      setError('포트폴리오 목록을 새로고침하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {isEditPortfolioModalOpen && (
        <EditPortfolioModal
          portfolio={selectedPortfolio}
          onSuccess={handleSuccessfulUpdate}
        />
      )}
      {isDeletePortfolioModalOpen && (
        <DeletePortfolioModal
          portfolioId={selectedPortfolio?.portfolio_id ?? null}
          onSuccess={handleSuccessfulUpdate}
        />
      )}
      <h5 className='text-[1.25rem] font-semibold text-slate-700 mb-4'>
        포트폴리오 관리
      </h5>
      <div className='flex flex-col bg-white rounded-lg shadow-xl p-6'>
        <div className='mb-7'>
          <button
            className='flex items-center bg-[#e1f0ff] hover:bg-[#3699ff] text-[#3699ff] hover:text-white px-3.5 py-2 text-sm rounded-[0.5rem] transition-all'
            onClick={() => router.push('/new-portfolio')}
          >
            <FontAwesomeIcon
              icon={faPlus as IconProp}
              className='w-4 h-4 mr-2'
            />
            포트폴리오 추가
          </button>
        </div>

        {loading ? (
          <div className='py-10 text-center text-slate-500'>
            포트폴리오를 불러오는 중...
          </div>
        ) : error ? (
          <div className='py-10 text-center text-red-500'>{error}</div>
        ) : portfolios.length === 0 ? (
          <div className='py-10 text-center text-slate-500'>
            등록된 포트폴리오가 없습니다. 새로운 포트폴리오를 추가해보세요.
          </div>
        ) : (
          <table className='w-full text-sm overflow-x-auto'>
            <colgroup>
              <col style={{ width: 'auto' }} />
              <col style={{ width: '5rem' }} />
            </colgroup>
            <thead>
              <tr>
                <th className='pb-3 text-left text-slate-400 font-normal whitespace-nowrap'>
                  이름
                </th>
                <th className='pb-3 text-left text-slate-400 font-normal'></th>
              </tr>
            </thead>
            <tbody>
              {portfolios.map((portfolio) => (
                <tr className='border-t' key={portfolio.portfolio_id}>
                  <td className='py-3'>
                    <div className='flex flex-row items-center gap-2 '>
                      <span className='p-1 flex justify-center items-center bg-slate-100 rounded-md'>
                        <svg
                          className='text-gray-400'
                          xmlns='http://www.w3.org/2000/svg'
                          width='18'
                          height='18'
                          viewBox='0 0 24 24'
                          fill='none'
                        >
                          <g
                            id='Stockholm-icons-/-General-/-Portfolio'
                            stroke='none'
                            strokeWidth='1'
                            fill='none'
                            fillRule='evenodd'
                          >
                            <path
                              opacity='0.3'
                              d='M20 15H4C2.9 15 2 14.1 2 13V7C2 6.4 2.4 6 3 6H21C21.6 6 22 6.4 22 7V13C22 14.1 21.1 15 20 15ZM13 12H11C10.5 12 10 12.4 10 13V16C10 16.5 10.4 17 11 17H13C13.6 17 14 16.6 14 16V13C14 12.4 13.6 12 13 12Z'
                              fill='currentColor'
                            ></path>
                            <path
                              d='M14 6V5H10V6H8V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V6H14ZM20 15H14V16C14 16.6 13.5 17 13 17H11C10.5 17 10 16.6 10 16V15H4C3.6 15 3.3 14.9 3 14.7V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V14.7C20.7 14.9 20.4 15 20 15Z'
                              fill='currentColor'
                            ></path>
                          </g>
                        </svg>
                      </span>
                      <span className='text-slate-700'>
                        {portfolio.portfolio_name}
                      </span>
                    </div>
                  </td>
                  <td className='py-3'>
                    <div className='flex flex-row items-center gap-2'>
                      <button
                        className='p-2 bg-[#e1f0ff] hover:bg-[#3699ff] text-[#3699ff] hover:text-white rounded-[0.5rem] transition-all'
                        onClick={() => handleEdit(portfolio)}
                      >
                        <FontAwesomeIcon
                          icon={faPen as IconProp}
                          className='w-4 h-4 block'
                        />
                      </button>
                      <button
                        className='p-2 bg-[#FFE2E5] hover:bg-[#F64E60] text-[#f64e60] hover:text-white rounded-[0.5rem] transition-all'
                        onClick={() => handleDelete(portfolio)}
                      >
                        <Trash2 className='w-4 h-4 block' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
