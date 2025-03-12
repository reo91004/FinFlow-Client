'use client';

import { useEffect, useState } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { usePortfolioStore, Portfolio } from '@/app/store/usePortfolioStore';

// 편집 모달 컴포넌트
function EditPortfolioModal({
  portfolio,
  onClose,
  onSuccess,
}: {
  portfolio: Portfolio;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [portfolioName, setPortfolioName] = useState(portfolio.portfolio_name);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const { updatePortfolio } = usePortfolioStore();

  const handleSave = async () => {
    if (!portfolioName.trim()) {
      setModalError('포트폴리오 이름을 입력해주세요.');
      return;
    }

    setModalLoading(true);
    setModalError('');

    try {
      const success = await updatePortfolio(
        portfolio.portfolio_id,
        portfolioName
      );

      if (success) {
        await Swal.fire({
          title: '포트폴리오가 수정되었습니다!',
          icon: 'success',
          confirmButtonText: '확인',
          confirmButtonColor: '#3699ff',
        });
        onSuccess();
        onClose();
      } else {
        setModalError('포트폴리오 이름 수정에 실패했습니다.');
      }
    } catch (error) {
      setModalError('포트폴리오를 수정하는 중 오류가 발생했습니다.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <div className='fixed inset-0 bg-black/25 z-[60]' onClick={onClose}></div>
      <div className='fixed top-1/4 left-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2'>
        <div
          className='bg-white rounded-lg shadow-xl p-6 animate-fade-in-down'
          onClick={(e) => e.stopPropagation()}
        >
          <div className='pb-4 mb-4 border-b'>
            <div className='flex flex-row justify-between items-center'>
              <h2 className='text-xl font-semibold'>포트폴리오 수정</h2>
              <button
                className='text-3xl text-slate-300 hover:text-[#3699ff] transition-all'
                onClick={onClose}
                disabled={modalLoading}
                type='button'
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !modalLoading) handleSave();
              }}
              disabled={modalLoading}
            />
            {modalError && (
              <p className='text-red-500 text-xs mt-1'>{modalError}</p>
            )}
          </div>
          <div className='flex flex-row justify-end gap-2'>
            <button
              className='px-6 py-3 bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-500 rounded-md transition-all'
              onClick={onClose}
              disabled={modalLoading}
              type='button'
            >
              취소
            </button>
            <button
              className='px-6 py-3 bg-[#3699ff] hover:bg-[#187de4] text-sm font-semibold text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleSave}
              disabled={modalLoading}
              type='button'
            >
              {modalLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// 삭제 확인 모달 컴포넌트
function DeletePortfolioModal({
  portfolio,
  onClose,
  onSuccess,
}: {
  portfolio: Portfolio;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [modalLoading, setModalLoading] = useState(false);
  const { deletePortfolio } = usePortfolioStore();

  const handleConfirmDelete = async () => {
    setModalLoading(true);

    try {
      const success = await deletePortfolio(portfolio.portfolio_id);

      if (success) {
        await Swal.fire({
          title: '포트폴리오가 삭제되었습니다!',
          icon: 'success',
          confirmButtonText: '확인',
          confirmButtonColor: '#3699ff',
        });
        onSuccess();
        onClose();
      } else {
        await Swal.fire({
          title: '오류',
          text: '포트폴리오를 삭제하는 중 오류가 발생했습니다.',
          icon: 'error',
          confirmButtonText: '확인',
          confirmButtonColor: '#3699ff',
        });
      }
    } catch (error) {
      await Swal.fire({
        title: '오류',
        text: '포트폴리오를 삭제하는 중 오류가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <div className='fixed inset-0 bg-black/25 z-[60]' onClick={onClose}></div>
      <div className='fixed top-1/4 left-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2'>
        <div
          className='bg-white rounded-lg shadow-xl p-6 animate-fade-in-down'
          onClick={(e) => e.stopPropagation()}
        >
          <div className='pb-4 mb-4 border-b'>
            <div className='flex flex-row justify-between items-center'>
              <h2 className='text-xl font-semibold'>포트폴리오 삭제</h2>
              <button
                className='text-3xl text-slate-300 hover:text-[#3699ff] transition-all'
                onClick={onClose}
                disabled={modalLoading}
                type='button'
              >
                ×
              </button>
            </div>
          </div>
          <div className='pb-4 mb-4 text-sm text-slate-700'>
            <p>
              정말 <strong>"{portfolio.portfolio_name}"</strong> 포트폴리오를
              삭제하시겠습니까?
            </p>
            <p className='mt-2 text-red-500'>이 작업은 되돌릴 수 없습니다.</p>
          </div>
          <div className='flex flex-row justify-end gap-2'>
            <button
              className='px-6 py-3 bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-500 rounded-md transition-all'
              onClick={onClose}
              disabled={modalLoading}
              type='button'
            >
              취소
            </button>
            <button
              className='px-6 py-3 bg-red-400 hover:bg-red-500 text-sm font-semibold text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleConfirmDelete}
              disabled={modalLoading}
              type='button'
            >
              {modalLoading ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    null
  );

  // Zustand 스토어에서 필요한 상태와 액션 가져오기
  const { portfolios, isLoading, error, fetchPortfolios } = usePortfolioStore();

  // 페이지 로드 시 포트폴리오 목록 불러오기
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const handleEdit = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsEditModalOpen(true);
  };

  const handleDelete = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  const handleSuccess = () => {
    fetchPortfolios(); // 성공 후 목록 새로고침
  };

  return (
    <div>
      {isEditModalOpen && selectedPortfolio && (
        <EditPortfolioModal
          portfolio={selectedPortfolio}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}

      {isDeleteModalOpen && selectedPortfolio && (
        <DeletePortfolioModal
          portfolio={selectedPortfolio}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
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

        {isLoading ? (
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
                        type='button'
                      >
                        <FontAwesomeIcon
                          icon={faPen as IconProp}
                          className='w-4 h-4 block'
                        />
                      </button>
                      <button
                        className='p-2 bg-[#FFE2E5] hover:bg-[#F64E60] text-[#f64e60] hover:text-white rounded-[0.5rem] transition-all'
                        onClick={() => handleDelete(portfolio)}
                        type='button'
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
