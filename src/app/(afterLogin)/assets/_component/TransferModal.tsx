import { useModalStore } from '@/app/store/modal';
import { useEffect, useState } from 'react';
import { usePortfolioStore } from '@/app/store/usePortfolioStore';
import axiosInstance from '@/utils/axiosInstance';

interface TransferModalProps {
  transferIds: number[];
  onSuccess?: () => void;
}

export default function TransferModal({
  transferIds,
  onSuccess,
}: TransferModalProps) {
  const { isTransferModalOpen, setIsTransferModalOpen } = useModalStore();
  const { portfolios, fetchPortfolios, isLoading, selectedPortfolio } =
    usePortfolioStore();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(
    null
  );
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 포트폴리오 목록 불러오기
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // 포트폴리오 목록이 로드되면 첫 번째 포트폴리오 선택
  useEffect(() => {
    if (portfolios.length > 0 && !selectedPortfolioId) {
      setSelectedPortfolioId(portfolios[0].portfolio_id);
    }
  }, [portfolios, selectedPortfolioId]);

  const handleTransfer = async () => {
    if (!selectedPortfolioId || !selectedPortfolio) return;
    if (!transferIds || transferIds.length === 0) {
      setError('전송할 자산이 선택되지 않았습니다.');
      return;
    }

    const sourcePortfolioId = selectedPortfolio.portfolio_id;

    // 동일한 포트폴리오로 전송하려는 경우 에러 처리
    if (sourcePortfolioId === selectedPortfolioId) {
      setError('원본과 대상 포트폴리오가 동일합니다.');
      return;
    }

    setIsTransferring(true);
    setError(null);

    try {
      // 각 선택된 자산에 대해 전송 요청 수행
      for (const financialProductId of transferIds) {
        await axiosInstance.patch('/assets/transfer', {
          source_portfolio_id: sourcePortfolioId,
          financial_product_id: financialProductId,
          target_portfolio_id: selectedPortfolioId,
        });
      }

      // 성공적으로 전송 완료
      setIsTransferModalOpen(false);
      // 필요하다면 포트폴리오 데이터 새로고침
      fetchPortfolios();
      // 자산 목록 새로고침을 위한 콜백 함수 호출
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || '자산 전송 중 오류가 발생했습니다.'
      );
      console.error('전송 오류:', err);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <>
      <div className='fixed inset-0 bg-black/25 z-[60]'></div>
      <div className='fixed top-[1/8] left-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2'>
        <div className='bg-white rounded-lg shadow-xl p-6 animate-fade-in-down'>
          <div className='pb-4 mb-4 border-b'>
            <div className='flex flex-row justify-between items-center'>
              <h2 className='text-xl font-semibold'>보유 자산 전송</h2>
              <button
                className='text-3xl text-slate-300 hover:text-[#3699ff] transition-all'
                onClick={() => setIsTransferModalOpen(false)}
              >
                ×
              </button>
            </div>
          </div>
          <div className='flex flex-col pb-4 mb-4'>
            <label className='text-sm text-slate-700 mb-2'>
              보유 자산을 전송할 포트폴리오를 선택하세요.
            </label>
            {isLoading ? (
              <div className='p-3 bg-slate-100 text-sm text-slate-500 rounded-md'>
                포트폴리오 목록을 불러오는 중...
              </div>
            ) : portfolios.length === 0 ? (
              <div className='p-3 bg-slate-100 text-sm text-slate-500 rounded-md'>
                사용 가능한 포트폴리오가 없습니다.
              </div>
            ) : (
              <select
                className='p-3 bg-slate-100 text-sm text-slate-700 rounded-md'
                value={selectedPortfolioId || ''}
                onChange={(e) => setSelectedPortfolioId(Number(e.target.value))}
              >
                {portfolios.map((portfolio) => (
                  <option
                    key={portfolio.portfolio_id}
                    value={portfolio.portfolio_id}
                    disabled={
                      portfolio.portfolio_id === selectedPortfolio?.portfolio_id
                    }
                  >
                    {portfolio.portfolio_name}
                    {portfolio.portfolio_id ===
                      selectedPortfolio?.portfolio_id && ' (현재 포트폴리오)'}
                  </option>
                ))}
              </select>
            )}
          </div>
          {error && (
            <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm'>
              {error}
            </div>
          )}
          <div className='flex flex-row justify-end gap-2'>
            <button
              className='px-6 py-3 bg-[#e1f0ff] hover:bg-[#3699ff] text-sm font-semibold text-[#3699ff] hover:text-white rounded-md transition-all'
              onClick={() => setIsTransferModalOpen(false)}
              disabled={isTransferring}
            >
              취소
            </button>
            <button
              className='px-6 py-3 bg-[#3699ff] hover:bg-[#187de4] text-sm font-semibold text-white rounded-md transition-all'
              disabled={
                !selectedPortfolioId ||
                portfolios.length === 0 ||
                isTransferring ||
                selectedPortfolioId === selectedPortfolio?.portfolio_id
              }
              onClick={handleTransfer}
            >
              {isTransferring ? '전송 중...' : '전송'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
