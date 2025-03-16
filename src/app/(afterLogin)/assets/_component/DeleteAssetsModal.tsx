import { useModalStore } from '@/app/store/modal';
import { usePortfolioStore } from '@/app/store/usePortfolioStore';
import { useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { toast } from 'react-toastify';

// 자산 타입 정의 (필요에 따라 실제 타입에 맞게 조정)
interface Asset {
  id: number;
  // 필요한 다른 속성들
}

export default function DeleteAssetsModal({
  onDelete,
  assetsToDelete,
}: {
  onDelete?: () => void;
  assetsToDelete: Asset[];
}) {
  const { setIsAssetsDeleteModalOpen } = useModalStore();
  const { selectedPortfolio } = usePortfolioStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!assetsToDelete || assetsToDelete.length === 0) {
      toast.error('삭제할 자산이 선택되지 않았습니다');
      return;
    }

    if (!selectedPortfolio) {
      toast.error('선택된 포트폴리오가 없습니다');
      return;
    }

    try {
      setIsDeleting(true);

      const assetsToDeletePayload = assetsToDelete.map((asset) => ({
        portfolio_id: selectedPortfolio.portfolio_id,
        financial_product_id: asset.id,
        currency_code: 'KRW',
        price: 0,
        quantity: 0,
      }));

      await axiosInstance.delete('/assets', {
        data: assetsToDeletePayload,
      });

      setIsAssetsDeleteModalOpen(false);

      toast.success('선택된 자산이 성공적으로 삭제되었습니다.');

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('자산 삭제 중 오류 발생:', error);
      toast.error('자산 삭제 중 오류가 발생했습니다', {
        position: 'top-center',
        autoClose: 3000,
        style: { zIndex: 99999 },
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className='fixed inset-0 bg-black/25 z-[60]'></div>
      <div className='fixed top-1/2 left-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2'>
        <div className='bg-white rounded-lg shadow-xl p-6 animate-fade-in-down'>
          <div className='pb-4 mb-4 border-b'>
            <div className='flex flex-row justify-between items-center'>
              <h2 className='text-xl font-semibold'>보유 자산 삭제</h2>
              <button
                className='text-3xl text-slate-300 hover:text-[#3699ff] transition-all'
                onClick={() => setIsAssetsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                ×
              </button>
            </div>
          </div>
          <div className='pb-4 mb-4 text-sm text-slate-700'>
            {assetsToDelete && assetsToDelete.length > 0
              ? `${assetsToDelete.length}개의 보유 자산을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`
              : '삭제할 자산이 선택되지 않았습니다.'}
          </div>
          <div className='flex flex-row justify-end gap-2'>
            <button
              className='px-6 py-3 bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-500 rounded-md transition-all'
              onClick={() => setIsAssetsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              취소
            </button>
            <button
              className={`px-6 py-3 ${
                isDeleting ? 'bg-red-300' : 'bg-red-400 hover:bg-red-500'
              } text-sm font-semibold text-white rounded-md transition-all`}
              onClick={handleDelete}
              disabled={
                isDeleting || !assetsToDelete || assetsToDelete.length === 0
              }
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
