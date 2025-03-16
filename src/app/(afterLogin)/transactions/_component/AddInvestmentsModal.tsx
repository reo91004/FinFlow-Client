import { useCurrencyStore } from '@/app/store/currency';
import { useModalStore } from '@/app/store/modal';
import { usePortfolioStore } from '@/app/store/usePortfolioStore';
import { useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { FinancialProduct } from '@/model/FinancialProduct';
import Swal from 'sweetalert2';

export default function AddInvestmentsModal({
  selectedProduct: initialProduct,
  onSuccess,
}: {
  selectedProduct?: FinancialProduct | null;
  onSuccess?: () => void;
}) {
  const { isInvestmentsModalOpen, setIsInvestmentsModalOpen } = useModalStore();
  const { selectedCurrency, currencies, setCurrency } = useCurrencyStore();
  const { selectedPortfolio } = usePortfolioStore();

  // 검색 입력값과 선택한 FinancialProduct를 분리해서 관리
  const [tickerInput, setTickerInput] = useState(
    initialProduct
      ? `${initialProduct.ticker} - ${initialProduct.product_name}`
      : ''
  );
  const [selectedProduct, setSelectedProduct] =
    useState<FinancialProduct | null>(initialProduct || null);
  // input 포커스 여부 관리
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [type, setType] = useState('구매');
  const [date, setDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [selectedPriceCurrency, setSelectedPriceCurrency] =
    useState(selectedCurrency);
  const [errors, setErrors] = useState({
    ticker: '',
    date: '',
    quantity: '',
    price: '',
    currency: '',
    quantity_limit: '',
    portfolio: '',
  });
  const [searchResults, setSearchResults] = useState<FinancialProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    const newErrors = {
      ticker: '',
      date: '',
      quantity: '',
      price: '',
      currency: '',
      quantity_limit: '',
      portfolio: '',
    };

    let isValid = true;

    if (!selectedProduct) {
      newErrors.ticker = '티커명/회사 이름을 선택해주세요';
      isValid = false;
    }
    if (!date) {
      newErrors.date = '날짜를 선택해주세요';
      isValid = false;
    }
    if (!quantity) {
      newErrors.quantity = '수량을 입력해주세요';
      isValid = false;
    }
    if (!price) {
      newErrors.price = '가격을 입력해주세요';
      isValid = false;
    }
    if (!selectedPortfolio) {
      newErrors.portfolio = '선택된 포트폴리오가 없습니다';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      setErrorMessage('');

      // 기존 에러 초기화
      setErrors({
        ticker: '',
        date: '',
        quantity: '',
        price: '',
        currency: '',
        quantity_limit: '',
        portfolio: '',
      });

      try {
        const payload = {
          portfolio_id: selectedPortfolio?.portfolio_id,
          financial_product_id: selectedProduct?.financial_product_id,
          currency_code: selectedPriceCurrency,
          price: parseFloat(price),
          quantity: parseFloat(quantity),
          transaction_type: type,
          transaction_date: new Date(date),
        };

        const response = await axiosInstance.post('/assets/', payload);

        // 성공적으로 요청이 처리되면 모달을 닫고 성공 메시지를 표시합니다
        setIsInvestmentsModalOpen(false);

        Swal.fire({
          title: '성공!',
          text: '거래 내역이 성공적으로 추가되었습니다.',
          icon: 'success',
          confirmButtonText: '확인',
          confirmButtonColor: '#3699ff',
        });

        // 성공 콜백 실행 (추가된 부분)
        if (onSuccess) {
          onSuccess();
        }
      } catch (error: any) {
        console.error('거래 추가 실패:', error);

        // 특정 에러 메시지에 따라 다른 위치에 에러 표시
        if (
          error.response?.data?.detail ===
          '요청한 화폐 단위가 기존 화폐 단위와 다릅니다.'
        ) {
          setErrors((prev) => ({
            ...prev,
            currency: error.response.data.detail,
          }));
        } else if (
          error.response?.data?.detail ===
          '판매 수량이 현재 보유 중인 자산의 수량보다 많습니다.'
        ) {
          setErrors((prev) => ({
            ...prev,
            quantity_limit: error.response.data.detail,
          }));
        } else {
          // 다른 에러는 기존처럼 Swal로 표시
          Swal.fire({
            title: '오류 발생',
            text:
              error.response?.data?.detail ||
              '거래 추가에 실패했습니다. 다시 시도해주세요.',
            icon: 'error',
            confirmButtonText: '확인',
            confirmButtonColor: '#3699ff',
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length > 0) {
      try {
        const response = await axiosInstance.get(
          `/assets/search?query=${query}`
        );
        setSearchResults(response.data);
      } catch (error) {
        console.error('검색 오류:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <>
      <div className='fixed inset-0 bg-black/25 z-[60]'></div>
      <div className='fixed top-1/2 left-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2'>
        <div className='bg-white rounded-lg shadow-xl p-6 animate-fade-in-down'>
          <div className='pb-4 mb-4 border-b'>
            <div className='flex flex-row justify-between items-center'>
              <h2 className='text-xl font-semibold'>새로운 거래 내역</h2>
              <button
                className='text-3xl text-slate-300 hover:text-[#3699ff] transition-all'
                onClick={() => setIsInvestmentsModalOpen(false)}
              >
                ×
              </button>
            </div>
          </div>
          <div className='flex flex-col pb-4 mb-4 border-b'>
            {!selectedPortfolio && (
              <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-md'>
                <p className='text-sm'>포트폴리오를 먼저 선택해주세요.</p>
              </div>
            )}
            <div className='relative flex flex-col mb-4'>
              <label className='text-sm text-slate-700 mb-2'>
                티커명/회사 이름
              </label>
              <input
                type='text'
                value={
                  selectedProduct
                    ? `${selectedProduct.ticker} - ${selectedProduct.product_name}`
                    : tickerInput
                }
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChange={(e) => {
                  // 사용자가 입력 시 선택값 초기화
                  setTickerInput(e.target.value);
                  setSelectedProduct(null);
                  handleSearch(e.target.value);
                }}
                className='p-3 bg-slate-100 text-sm text-slate-700 rounded-md'
                placeholder='티커명이나 회사 이름을 입력해주세요.'
              />
              {errors.ticker && (
                <p className='text-red-500 text-xs mt-1'>{errors.ticker}</p>
              )}
              {/* input이 포커스된 경우에만 검색 결과 리스트 표시 */}
              {isInputFocused && searchResults.length > 0 && (
                <ul className='absolute top-[4.25rem] bg-white border border-slate-300 shadow-sm rounded-md mt-2 overflow-y-auto max-h-56 w-[464px]'>
                  {searchResults.map((result) => (
                    <li
                      key={result.financial_product_id}
                      className='p-2 hover:bg-slate-200 cursor-pointer flex flex-row items-center'
                      // 마우스 다운 시 preventDefault를 호출하여 onBlur가 발생하지 않도록 함
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedProduct(result);
                        setTickerInput(
                          `${result.ticker} - ${result.product_name}`
                        );
                        setSearchResults([]); // 검색 결과 초기화
                      }}
                    >
                      <img
                        src={`https://assets.parqet.com/logos/symbol/${result.ticker}`}
                        alt={result.ticker}
                        className='w-[30px] h-[30px] min-h-[30px] max-h-[30px] object-contain rounded-sm'
                      />
                      <div className='flex flex-col ml-2 text-sm'>
                        <span className='text-slate-500'>{result.ticker}</span>
                        <span className='text-slate-700'>
                          {result.product_name}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className='flex flex-row mb-4 gap-4'>
              <div className='flex flex-col flex-1'>
                <label className='text-sm text-slate-700 mb-2'>거래 종류</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className='p-3 bg-slate-100 text-sm text-slate-700 rounded-md'
                >
                  <option>구매</option>
                  <option>판매</option>
                </select>
              </div>
              <div className='flex flex-col flex-1'>
                <label className='text-sm text-slate-700 mb-2'>날짜</label>
                <input
                  type='date'
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className='p-3 bg-slate-100 text-sm text-slate-700 rounded-md'
                />
                {errors.date && (
                  <p className='text-red-500 text-xs mt-1'>{errors.date}</p>
                )}
              </div>
            </div>
            <div className='flex flex-row mb-4 gap-4'>
              <div className='flex flex-col flex-1'>
                <label className='text-sm text-slate-700 mb-2'>수량</label>
                <input
                  type='number'
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder='수량'
                  className='p-3 bg-slate-100 text-sm text-slate-700 rounded-md'
                />
                {errors.quantity && (
                  <p className='text-red-500 text-xs mt-1'>{errors.quantity}</p>
                )}
                {errors.quantity_limit && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.quantity_limit}
                  </p>
                )}
              </div>
              <div className='flex flex-col flex-1'>
                <label className='text-sm text-slate-700 mb-2'>가격</label>
                <div className='flex'>
                  <input
                    type='number'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder='가격'
                    className='p-3 bg-slate-100 text-sm text-slate-700 rounded-l-md w-full'
                  />
                  <select
                    className='p-3 bg-slate-100 text-sm text-slate-700 rounded-r-md border-slate-200'
                    value={selectedPriceCurrency}
                    onChange={(e) => setSelectedPriceCurrency(e.target.value)}
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.price && (
                  <p className='text-red-500 text-xs mt-1'>{errors.price}</p>
                )}
                {errors.currency && (
                  <p className='text-red-500 text-xs mt-1'>{errors.currency}</p>
                )}
              </div>
            </div>
          </div>
          <div className='flex flex-row justify-end gap-2'>
            <button
              className='px-3 py-2 bg-slate-100 hover:bg-slate-300 text-sm font-semibold text-slate-700 rounded-md transition-all'
              onClick={() => setIsInvestmentsModalOpen(false)}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              className='px-3 py-2 bg-[#e1f0ff] hover:bg-[#3699ff] text-sm font-semibold text-[#3699ff] hover:text-white rounded-md transition-all'
              onClick={handleSubmit}
              disabled={isLoading || !selectedPortfolio}
            >
              {isLoading ? '처리 중...' : '추가'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
