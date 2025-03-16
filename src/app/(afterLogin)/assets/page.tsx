'use client';

import { useState, useEffect } from 'react';
import { useCurrencyStore } from '@/app/store/currency.ts';
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { useModalStore } from '@/app/store/modal';
import { useRouter } from 'next/navigation';
import TransferModal from './_component/TransferModal';
import { formatCurrency } from '@/utils/formatCurrency';
import Collapse from '@mui/material/Collapse';
import Skeleton from '@mui/material/Skeleton';
import DeleteAssetsModal from './_component/DeleteAssetsModal';
import AddInvestmentsModal from '../transactions/_component/AddInvestmentsModal';
import axiosInstance from '@/utils/axiosInstance';
import { usePortfolioStore } from '@/app/store/usePortfolioStore';
import { Asset } from '@/model/Asset';
import { FinancialProduct } from '@/model/FinancialProduct';

interface AssetsResponse {
  total: number;
  page: number;
  per_page: number;
  assets: Asset[];
}

// 시장 데이터 타입 (실시간 현재가, 전일 종가, 배당금 등)
interface MarketData {
  currentPrice: number; // 실시간 현재가
  previousClose: number; // 전일 종가
  dividend: number; // 1주당 배당금 (예시로 0 처리)
}

export default function Page() {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const { selectedCurrency } = useCurrencyStore();
  const [displayCurrency, setDisplayCurrency] = useState<
    'original' | 'converted'
  >('converted');
  const {
    isInvestmentsModalOpen,
    setIsInvestmentsModalOpen,
    isTransferModalOpen,
    setIsTransferModalOpen,
    isAssetsDeleteModalOpen,
    setIsAssetsDeleteModalOpen,
  } = useModalStore();

  const router = useRouter();

  // usePortfolioStore에서 selectedPortfolio 가져오기
  const { selectedPortfolio, fetchPortfolios } = usePortfolioStore();

  // API 호출 상태 관리
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assetsData, setAssetsData] = useState<Asset[]>([]);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  // 외부 환율 정보를 저장할 상태 (ExchangeRate-API 사용)
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {}
  );

  // 외부 시장 데이터를 저장할 상태 (티커별 현재가, 전일 종가, 배당금)
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});

  const [selectedAssetInfo, setSelectedAssetInfo] =
    useState<FinancialProduct | null>(null);

  // 컴포넌트 마운트 시 포트폴리오 목록 가져오기
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // 자산 데이터 가져오기 함수 (컴포넌트 레벨에서 정의)
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<AssetsResponse>('/assets', {
        params: {
          portfolio_id: selectedPortfolio.portfolio_id,
          page: currentPage,
          per_page: perPage,
        },
      });
      setAssetsData(response.data.assets || []);
      setTotalAssets(response.data.total);
      setError(null);
      // 선택된 항목 초기화 (삭제/전송 버튼 숨김)
      setSelectedItems([]);
    } catch (err) {
      console.error('자산 데이터를 가져오는 중 오류 발생:', err);
      setError('자산 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 자산 데이터 가져오기 (내부 API)
  useEffect(() => {
    // 선택된 포트폴리오가 없으면 데이터를 가져오지 않음
    if (!selectedPortfolio) {
      setLoading(false);
      return;
    }

    fetchAssets();
  }, [currentPage, perPage, selectedPortfolio]); // selectedPortfolio 의존성 추가

  // 외부 환율 API 호출 (ExchangeRate-API 예시)
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await axiosInstance.get(
          'https://api.exchangerate-api.com/v4/latest/USD'
        );
        // 응답 예시: { base: "USD", rates: { KRW: 1344.5, EUR: 0.92, ... } }
        setExchangeRates(response.data.rates);
      } catch (err) {
        console.error('환율 정보를 가져오는 중 오류 발생:', err);
      }
    };
    fetchExchangeRates();
  }, []);

  // 초기 시장 데이터 API 호출 (REST API)
  useEffect(() => {
    if (assetsData.length === 0) return;
    const fetchMarketData = async () => {
      try {
        const tickers = Array.from(
          new Set(assetsData.map((asset) => asset.financial_product.ticker))
        );
        const marketDataResponses = await Promise.all(
          tickers.map(async (ticker) => {
            // Finnhub의 quote API 사용 (현재가 및 전일 종가)
            const response = await axiosInstance.get(
              `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=cv6lefpr01qi7f6qu5i0cv6lefpr01qi7f6qu5ig`
            );
            return {
              ticker,
              currentPrice: response.data.c,
              previousClose: response.data.pc,
              dividend: 0,
            };
          })
        );
        const marketDataMap = marketDataResponses.reduce((acc, item) => {
          acc[item.ticker] = {
            currentPrice: item.currentPrice,
            previousClose: item.previousClose,
            dividend: item.dividend,
          };
          return acc;
        }, {} as Record<string, MarketData>);
        setMarketData(marketDataMap);
      } catch (err) {
        console.error('시장 데이터를 가져오는 중 오류 발생:', err);
      }
    };

    fetchMarketData();
  }, [assetsData]);

  // 웹소켓을 이용한 실시간 시장 데이터 업데이트
  useEffect(() => {
    if (assetsData.length === 0) return;
    const tickers = Array.from(
      new Set(assetsData.map((asset) => asset.financial_product.ticker))
    );
    const socket = new WebSocket(
      'wss://ws.finnhub.io?token=cv6lefpr01qi7f6qu5i0cv6lefpr01qi7f6qu5ig'
    );

    socket.onopen = () => {
      // 모든 티커에 대해 구독 요청 전송
      tickers.forEach((ticker) => {
        socket.send(JSON.stringify({ type: 'subscribe', symbol: ticker }));
      });
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'trade' && data.data) {
        data.data.forEach(
          (trade: { p: number; s: string; t: number; v: number }) => {
            setMarketData((prev) => ({
              ...prev,
              [trade.s]: {
                // 실시간 현재가 업데이트. 이전 종가는 기존 값 유지하거나 없으면 현재가로 설정
                currentPrice: trade.p,
                previousClose: prev[trade.s]?.previousClose || trade.p,
                dividend: prev[trade.s]?.dividend || 0,
              },
            }));
          }
        );
      }
    };

    return () => {
      // 컴포넌트 언마운트 시 구독 해제 후 소켓 닫기
      if (socket.readyState === WebSocket.OPEN) {
        tickers.forEach((ticker) => {
          socket.send(JSON.stringify({ type: 'unsubscribe', symbol: ticker }));
        });
      }
      socket.close();
    };
  }, [assetsData]);

  // 통화 변환 함수 (환율 정보 사용)
  const convertAmount = (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency])
      return amount;
    const baseAmount = amount / exchangeRates[fromCurrency];
    return baseAmount * exchangeRates[toCurrency];
  };

  // 테이블에 표시할 데이터 구성 (실시간 시장 데이터 사용)
  const tableData = assetsData.map((asset) => {
    const ticker = asset.financial_product.ticker;
    // 실시간 데이터가 없으면 axios 초기값 사용
    const market = marketData[ticker] || {
      currentPrice: asset.price,
      previousClose: asset.price,
      dividend: 0,
    };
    return {
      id: asset.financial_product.financial_product_id,
      name: asset.financial_product.product_name,
      symbol: ticker,
      logo: `https://assets.parqet.com/logos/symbol/${ticker}`,
      quantity: asset.quantity,
      purchasePrice: asset.price,
      purchaseCurrency: asset.currency_code,
      totalPurchase: asset.price * asset.quantity,
      currentPrice: market.currentPrice * asset.quantity,
      dividend: market.dividend * asset.quantity,
      dividendYield: market.dividend
        ? (market.dividend / asset.price) * 100
        : 0,
      // 총 수익: (실시간 현재가 - 매수가) × 보유량
      totalProfit: (market.currentPrice - asset.price) * asset.quantity,
      // 일간 수익: (실시간 현재가 - 전일 종가) × 보유량
      dailyProfit:
        (market.currentPrice - market.previousClose) * asset.quantity,
    };
  });

  // 전체 합계 계산 (변환 모드일 경우)
  const totals = tableData.reduce(
    (acc, item) => {
      const convertedPurchase = convertAmount(
        item.totalPurchase,
        item.purchaseCurrency,
        selectedCurrency
      );
      const convertedCurrent = convertAmount(
        item.currentPrice,
        item.purchaseCurrency,
        selectedCurrency
      );
      const convertedDividend = convertAmount(
        item.dividend,
        item.purchaseCurrency,
        selectedCurrency
      );
      const convertedTotalProfit = convertAmount(
        item.totalProfit,
        item.purchaseCurrency,
        selectedCurrency
      );
      const convertedDailyProfit = convertAmount(
        item.dailyProfit,
        item.purchaseCurrency,
        selectedCurrency
      );

      return {
        quantity: acc.quantity + item.quantity,
        totalPurchase: acc.totalPurchase + convertedPurchase,
        currentPrice: acc.currentPrice + convertedCurrent,
        dividend: acc.dividend + convertedDividend,
        dividendYield: 0, // 나중에 계산
        totalProfit: acc.totalProfit + convertedTotalProfit,
        dailyProfit: acc.dailyProfit + convertedDailyProfit,
      };
    },
    {
      quantity: 0,
      totalPurchase: 0,
      currentPrice: 0,
      dividend: 0,
      dividendYield: 0,
      totalProfit: 0,
      dailyProfit: 0,
    }
  );

  totals.dividendYield = totals.totalPurchase
    ? (totals.dividend / totals.totalPurchase) * 100
    : 0;

  const toggleDropdown = (id: number) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleClickOutside = () => {
    setOpenDropdownId(null);
  };

  const handleMenuAction = (
    action: 'add' | 'transfer' | 'delete',
    itemId: number
  ) => {
    switch (action) {
      case 'add':
        console.log('거래 추가:', itemId);
        // 선택한 자산 정보 찾기 및 저장
        const assetInfo = assetsData.find(
          (asset) => asset.financial_product.financial_product_id === itemId
        );
        if (assetInfo) {
          setSelectedAssetInfo(assetInfo.financial_product);
        }
        setIsInvestmentsModalOpen(true);
        break;
      case 'transfer':
        console.log('전송:', itemId);
        setIsTransferModalOpen(true);
        break;
      case 'delete':
        console.log('삭제:', itemId);
        setIsAssetsDeleteModalOpen(true);
        break;
    }
    setOpenDropdownId(null);
  };

  const handleDeleteAssets = () => {
    // 선택된 ID에 해당하는 자산 객체 찾기
    const assetsToDelete = selectedItems
      .map((id) => tableData.find((item) => item.id === id))
      .filter(Boolean);

    // 모달 열기
    setIsAssetsDeleteModalOpen(true);
  };

  const handleTransfer = () => {
    console.log('Transfer items:', selectedItems);
    setIsTransferModalOpen(true);
  };

  const getDisplayAmount = (amount: number, originalCurrency: string) => {
    if (displayCurrency === 'original') {
      return formatCurrency(amount, originalCurrency);
    }
    return formatCurrency(
      convertAmount(amount, originalCurrency, selectedCurrency),
      selectedCurrency
    );
  };

  const uniqueCurrencies = Array.from(
    new Set(tableData.map((item) => item.purchaseCurrency))
  );
  const hasMultipleCurrencies = uniqueCurrencies.length > 1;

  let originalTotals = {
    totalPurchase: 0,
    currentPrice: 0,
    dividend: 0,
    totalProfit: 0,
    dailyProfit: 0,
  };

  if (!hasMultipleCurrencies && uniqueCurrencies.length === 1) {
    originalTotals = tableData.reduce(
      (acc, item) => ({
        totalPurchase: acc.totalPurchase + item.totalPurchase,
        currentPrice: acc.currentPrice + item.currentPrice,
        dividend: acc.dividend + item.dividend,
        totalProfit: acc.totalProfit + item.totalProfit,
        dailyProfit: acc.dailyProfit + item.dailyProfit,
      }),
      {
        totalPurchase: 0,
        currentPrice: 0,
        dividend: 0,
        totalProfit: 0,
        dailyProfit: 0,
      }
    );
  }

  const onClickAddInvestments = () => {
    setIsInvestmentsModalOpen(true);
    router.push('/transactions');
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalAssets / perPage);
  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(startIndex + perPage - 1, totalAssets);

  return (
    <>
      {isInvestmentsModalOpen && (
        <AddInvestmentsModal
          selectedProduct={selectedAssetInfo}
          portfolioId={selectedPortfolio?.portfolio_id}
          onSuccess={fetchAssets}
        />
      )}
      {isAssetsDeleteModalOpen && (
        <DeleteAssetsModal
          assetsToDelete={selectedItems
            .map((id) => tableData.find((item) => item.id === id))
            .filter(Boolean)}
          onDelete={fetchAssets}
        />
      )}
      {isTransferModalOpen && (
        <TransferModal transferIds={selectedItems} onSuccess={fetchAssets} />
      )}
      <div className='flex justify-end items-center mb-4'>
        <button
          className='bg-white hover:bg-slate-100 text-slate-700 flex justify-center items-center gap-2 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all shadow-xl'
          onClick={onClickAddInvestments}
        >
          <svg
            width='24px'
            height='24px'
            viewBox='0 0 24 24'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
          >
            <defs></defs>
            <g
              id='Stockholm-icons-/-Code-/-Plus'
              stroke='none'
              strokeWidth='1'
              fill='none'
              fillRule='evenodd'
            >
              <rect id='bound' x='0' y='0' width='24' height='24'></rect>
              <circle
                id='Oval-5'
                fill='currentColor'
                opacity='0.3'
                cx='12'
                cy='12'
                r='10'
              ></circle>
              <path
                d='M11,11 L11,7 C11,6.44771525 11.4477153,6 12,6 C12.5522847,6 13,6.44771525 13,7 L13,11 L17,11 C17.5522847,11 18,11.4477153 18,12 C18,12.5522847 17.5522847,13 17,13 L13,13 L13,17 C13,17.5522847 12.5522847,18 12,18 C11.4477153,18 11,17.5522847 11,17 L11,13 L7,13 C6.44771525,13 6,12.5522847 6,12 C6,11.4477153 6.44771525,11 7,11 L11,11 Z'
                id='Combined-Shape'
                fill='currentColor'
              ></path>
            </g>
          </svg>
          투자 추가
        </button>
      </div>
      <div className='p-10 bg-white rounded-2xl shadow-xl'>
        <div className='mb-8 bg-slate-100 rounded-[0.5rem] p-1 drop-shadow-sm inline-block'>
          <div className='flex space-x-1'>
            <button
              onClick={() => setDisplayCurrency('original')}
              className={`px-3 py-2 rounded-[0.5rem] text-sm font-medium transition-all ${
                displayCurrency === 'original'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-400 hover:bg-slate-200'
              }`}
            >
              구매 통화
            </button>
            <button
              onClick={() => setDisplayCurrency('converted')}
              className={`px-3 py-2 rounded-[0.5rem] text-sm font-medium transition-all ${
                displayCurrency === 'converted'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-400 hover:bg-slate-200'
              }`}
            >
              {selectedCurrency}
            </button>
          </div>
        </div>
        <Collapse in={selectedItems.length > 0} timeout='auto' unmountOnExit>
          <div className='mb-8'>
            <div className='flex items-center gap-2'>
              <button
                onClick={handleDeleteAssets}
                className='bg-[#FFE2E5] hover:bg-[#F64E60] text-[#f64e60] hover:text-white flex justify-center items-center gap-2 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all'
              >
                <Trash2 className='w-4 h-4' />
                삭제 ({selectedItems.length})
              </button>
              <button
                onClick={handleTransfer}
                className='bg-[#e1f0ff] hover:bg-[#3699ff] text-[#3699ff] hover:text-white flex justify-center items-center gap-2 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all'
              >
                <ArrowLeftRight className='w-4 h-4' />
                전송 ({selectedItems.length})
              </button>
            </div>
          </div>
        </Collapse>
        <div className='w-full'>
          {loading ? (
            <div className='space-y-4'>
              {/* 헤더 스켈레톤 */}
              <Skeleton variant='rectangular' height={40} />
              {/* 테이블 행을 흉내내는 스켈레톤 */}
              <Skeleton variant='rectangular' height={40} />
              <Skeleton variant='rectangular' height={40} />
              <Skeleton variant='rectangular' height={40} />
              <Skeleton variant='rectangular' height={40} />
            </div>
          ) : error ? (
            <div className='text-center py-10 text-red-500'>{error}</div>
          ) : tableData.length === 0 ? (
            <div className='text-center py-10 text-gray-500'>
              자산이 없습니다. 투자를 추가해보세요.
            </div>
          ) : (
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='w-[50px] px-4 pb-3 text-left font-normal align-middle'>
                    <input
                      type='checkbox'
                      className="w-4 h-4 appearance-none bg-slate-200 text-white rounded-[0.2rem] relative border-2 border-transparent checked:border-transparent checked:bg-[#3699FE] checked:before:block checked:before:content-['✓'] checked:before:absolute checked:before:inset-0 checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center transition-all"
                      checked={selectedItems.length === tableData.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(tableData.map((item) => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </th>
                  <th className='pb-3 text-left text-slate-400 font-normal'>
                    보유 자산
                  </th>
                  <th className='pb-3 text-left text-slate-400 font-normal'>
                    보유량
                  </th>
                  <th className='pb-3 text-left text-slate-400 font-normal'>
                    구매가
                  </th>
                  <th className='pb-3 text-left text-slate-400 font-normal'>
                    총 구매가
                  </th>
                  <th className='pb-3 text-left text-slate-400 font-normal'>
                    현재가
                  </th>
                  <th className='pb-3 text-left text-slate-400 font-normal'>
                    배당금
                  </th>
                  <th className='pb-3 text-left text-slate-400 font-normal'>
                    배당 수익률
                  </th>
                  <th className='pb-3 text-left text-slate-400 font-normal'>
                    총 수익
                  </th>
                  <th className='pb-3 text-left text-slate-400 font-normal'>
                    일간 수익
                  </th>
                  <th className='pb-3 text-left text-slate-400 font-normal'></th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item) => (
                  <tr key={item.id} className='border-b hover:bg-slate-100'>
                    <td className='px-4 py-3'>
                      <input
                        type='checkbox'
                        className="w-4 h-4 appearance-none bg-slate-200 text-white rounded-[0.2rem] relative border-2 border-transparent checked:border-transparent checked:bg-[#3699FE] checked:before:block checked:before:content-['✓'] checked:before:absolute checked:before:inset-0 checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center transition-all"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => {
                          setSelectedItems((prev) =>
                            prev.includes(item.id)
                              ? prev.filter((id) => id !== item.id)
                              : [...prev, item.id]
                          );
                        }}
                      />
                    </td>
                    <td className='py-3'>
                      <div className='flex items-center gap-2'>
                        <img
                          src={item.logo}
                          alt={`${item.name} Logo`}
                          className='w-6 h-6 object-contain rounded-sm'
                        />
                        <div>
                          <p className='font-medium text-slate-700'>
                            {item.name}
                          </p>
                          <p className='text-xs text-slate-500'>
                            {item.symbol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='py-3 text-slate-700'>{item.quantity}</td>
                    <td className='py-3 text-slate-700'>
                      {getDisplayAmount(
                        item.purchasePrice,
                        item.purchaseCurrency
                      )}
                    </td>
                    <td className='py-3 text-slate-700'>
                      {getDisplayAmount(
                        item.totalPurchase,
                        item.purchaseCurrency
                      )}
                    </td>
                    <td className='py-3'>
                      <div>
                        <p className='text-slate-700 font-semibold'>
                          {getDisplayAmount(
                            item.currentPrice,
                            item.purchaseCurrency
                          )}
                        </p>
                        <p className='text-xs text-slate-400'>
                          {getDisplayAmount(
                            item.currentPrice / item.quantity,
                            item.purchaseCurrency
                          )}
                        </p>
                      </div>
                    </td>
                    <td className='py-3'>
                      <div>
                        <p className='text-slate-700 font-semibold'>
                          {getDisplayAmount(
                            item.dividend,
                            item.purchaseCurrency
                          )}
                        </p>
                        <p className='text-xs text-slate-400'>
                          {getDisplayAmount(
                            item.dividend / item.quantity,
                            item.purchaseCurrency
                          )}
                        </p>
                      </div>
                    </td>
                    <td className='py-3 text-slate-700'>
                      {item.dividendYield.toFixed(2)}%
                    </td>
                    <td className='py-3'>
                      <div>
                        <p
                          className={
                            item.totalProfit >= 0
                              ? 'text-[#1bc5bd]'
                              : 'text-red-500'
                          }
                        >
                          {item.totalProfit >= 0 ? '+' : ''}
                          {getDisplayAmount(
                            item.totalProfit,
                            item.purchaseCurrency
                          )}
                        </p>
                        <p
                          className={`text-xs ${
                            item.totalProfit >= 0
                              ? 'text-[#1bc5bd]'
                              : 'text-red-500'
                          }`}
                        >
                          {item.totalPurchase
                            ? (
                                (item.totalProfit / item.totalPurchase) *
                                100
                              ).toFixed(2)
                            : 0}
                          %
                        </p>
                      </div>
                    </td>
                    <td className='py-3'>
                      <div>
                        <p
                          className={
                            item.dailyProfit >= 0
                              ? 'text-[#1bc5bd]'
                              : 'text-red-500'
                          }
                        >
                          {item.dailyProfit >= 0 ? '+' : ''}
                          {getDisplayAmount(
                            item.dailyProfit,
                            item.purchaseCurrency
                          )}
                        </p>
                        <p
                          className={`text-xs ${
                            item.dailyProfit >= 0
                              ? 'text-[#1bc5bd]'
                              : 'text-red-500'
                          }`}
                        >
                          {item.totalPurchase
                            ? (
                                (item.dailyProfit / item.totalPurchase) *
                                100
                              ).toFixed(2)
                            : 0}
                          %
                        </p>
                      </div>
                    </td>
                    <td className='py-3 relative'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(item.id);
                        }}
                        className='p-2 bg-slate-100 hover:bg-slate-200 text-gray-400 hover:text-gray-600 rounded-[0.5rem] transition-all'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='16'
                          height='16'
                          viewBox='0 0 256 256'
                        >
                          <g>
                            <path
                              fill='#7E8299'
                              d='M10,128c0,13.4,10.9,24.3,24.3,24.3s24.2-10.9,24.2-24.3s-10.9-24.3-24.3-24.3S10,114.6,10,128z'
                            />
                            <path
                              fill='#7E8299'
                              d='M103.7,128c0,13.4,10.9,24.3,24.3,24.3c13.4,0,24.3-10.9,24.3-24.3s-10.9-24.3-24.3-24.3C114.6,103.7,103.7,114.6,103.7,128L103.7,128z'
                            />
                            <path
                              fill='#7E8299'
                              d='M197.5,128c0,13.4,10.9,24.3,24.3,24.3c13.4,0,24.3-10.9,24.3-24.3c0-13.4-10.9-24.3-24.3-24.3C208.3,103.7,197.5,114.6,197.5,128z'
                            />
                          </g>
                        </svg>
                      </button>
                      {openDropdownId === item.id && (
                        <>
                          <div
                            className='fixed inset-0'
                            onClick={handleClickOutside}
                          />
                          <div className='absolute right-0 mt-2 w-32 bg-white rounded-[0.5rem] shadow-xl z-10 py-1'>
                            <button
                              onClick={() => handleMenuAction('add', item.id)}
                              className='w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-slate-100 flex items-center gap-2'
                            >
                              <Plus className='w-4 h-4' color='#b5b5c3' />
                              거래 추가
                            </button>
                            <button
                              onClick={() =>
                                handleMenuAction('transfer', item.id)
                              }
                              className='w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-slate-100 flex items-center gap-2'
                            >
                              <ArrowLeftRight
                                className='w-4 h-4'
                                color='#b5b5c3'
                              />
                              전송
                            </button>
                            <button
                              onClick={() =>
                                handleMenuAction('delete', item.id)
                              }
                              className='w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-slate-100 flex items-center gap-2'
                            >
                              <Trash2 className='w-4 h-4' />
                              삭제
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className='border-t'>
                <tr>
                  <td className='py-3'></td>
                  <td className='py-3 font-semibold text-slate-700'>Total</td>
                  <td className='py-3 font-semibold text-slate-700'>
                    {tableData.reduce((acc, item) => acc + item.quantity, 0)}
                  </td>
                  <td className='py-3 font-semibold text-slate-700'></td>
                  <td className='py-3 font-semibold text-slate-700'>
                    {displayCurrency === 'original' ? (
                      hasMultipleCurrencies ? (
                        <span>---</span>
                      ) : (
                        formatCurrency(
                          originalTotals.totalPurchase,
                          uniqueCurrencies[0]
                        )
                      )
                    ) : (
                      formatCurrency(totals.totalPurchase, selectedCurrency)
                    )}
                  </td>
                  <td className='py-3 font-semibold text-slate-700'>
                    {displayCurrency === 'original' ? (
                      hasMultipleCurrencies ? (
                        <span>---</span>
                      ) : (
                        formatCurrency(
                          originalTotals.currentPrice,
                          uniqueCurrencies[0]
                        )
                      )
                    ) : (
                      formatCurrency(totals.currentPrice, selectedCurrency)
                    )}
                  </td>
                  <td className='py-3 font-semibold text-slate-700'>
                    {displayCurrency === 'original' ? (
                      hasMultipleCurrencies ? (
                        <span>---</span>
                      ) : (
                        formatCurrency(
                          originalTotals.dividend,
                          uniqueCurrencies[0]
                        )
                      )
                    ) : (
                      formatCurrency(totals.dividend, selectedCurrency)
                    )}
                  </td>
                  <td className='py-3 font-semibold text-slate-700'>
                    {totals.dividendYield.toFixed(2)}%
                  </td>
                  <td className='py-3'>
                    <div>
                      {displayCurrency === 'original' ? (
                        hasMultipleCurrencies ? (
                          <p className='font-semibold text-slate-500'>---</p>
                        ) : (
                          <p
                            className={`font-semibold ${
                              originalTotals.totalProfit >= 0
                                ? 'text-[#1bc5bd]'
                                : 'text-red-500'
                            }`}
                          >
                            {originalTotals.totalProfit >= 0 ? '+' : ''}
                            {formatCurrency(
                              originalTotals.totalProfit,
                              uniqueCurrencies[0]
                            )}
                          </p>
                        )
                      ) : (
                        <p
                          className={`font-semibold ${
                            totals.totalProfit >= 0
                              ? 'text-[#1bc5bd]'
                              : 'text-red-500'
                          }`}
                        >
                          {totals.totalProfit >= 0 ? '+' : ''}
                          {formatCurrency(totals.totalProfit, selectedCurrency)}
                        </p>
                      )}
                      <p
                        className={`text-xs ${
                          totals.totalProfit >= 0
                            ? 'text-[#1bc5bd]'
                            : 'text-red-500'
                        }`}
                      >
                        {totals.totalPurchase
                          ? (
                              (totals.totalProfit / totals.totalPurchase) *
                              100
                            ).toFixed(2)
                          : 0}
                        %
                      </p>
                    </div>
                  </td>
                  <td className='py-3'>
                    <div>
                      {displayCurrency === 'original' ? (
                        hasMultipleCurrencies ? (
                          <p className='font-semibold text-slate-500'>---</p>
                        ) : (
                          <p
                            className={`font-semibold ${
                              originalTotals.dailyProfit >= 0
                                ? 'text-[#1bc5bd]'
                                : 'text-red-500'
                            }`}
                          >
                            {originalTotals.dailyProfit >= 0 ? '+' : ''}
                            {formatCurrency(
                              originalTotals.dailyProfit,
                              uniqueCurrencies[0]
                            )}
                          </p>
                        )
                      ) : (
                        <p
                          className={`font-semibold ${
                            totals.dailyProfit >= 0
                              ? 'text-[#1bc5bd]'
                              : 'text-red-500'
                          }`}
                        >
                          {totals.dailyProfit >= 0 ? '+' : ''}
                          {formatCurrency(totals.dailyProfit, selectedCurrency)}
                        </p>
                      )}
                      <p
                        className={`text-xs ${
                          totals.dailyProfit >= 0
                            ? 'text-[#1bc5bd]'
                            : 'text-red-500'
                        }`}
                      >
                        {totals.totalPurchase
                          ? (
                              (totals.dailyProfit / totals.totalPurchase) *
                              100
                            ).toFixed(2)
                          : 0}
                        %
                      </p>
                    </div>
                  </td>
                  <td className='py-3'></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
        <div className='flex justify-between mt-6'>
          <div className='flex flex-row gap-2'>
            <button
              className='w-8 h-8 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 flex justify-center items-center rounded-md transition-all'
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft width={16} height={16} />
            </button>
            <button
              className='w-8 h-8 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 flex justify-center items-center rounded-md transition-all'
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft width={16} height={16} />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageToShow =
                totalPages <= 5
                  ? i + 1
                  : currentPage <= 3
                  ? i + 1
                  : currentPage >= totalPages - 2
                  ? totalPages - 4 + i
                  : currentPage - 2 + i;
              return (
                <button
                  key={pageToShow}
                  className={`w-8 h-8 text-sm ${
                    currentPage === pageToShow
                      ? 'text-white bg-[#3699ff]'
                      : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                  } flex justify-center items-center rounded-md transition-all`}
                  onClick={() => handlePageChange(pageToShow)}
                >
                  {pageToShow}
                </button>
              );
            })}

            <button
              className='w-8 h-8 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 flex justify-center items-center rounded-md transition-all'
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight width={16} height={16} />
            </button>
            <button
              className='w-8 h-8 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 flex justify-center items-center rounded-md transition-all'
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight width={16} height={16} />
            </button>
          </div>
          <div className='flex flex-row items-center gap-4'>
            <select
              className='px-4 py-2 text-slate-700 bg-slate-100 text-sm rounded-md'
              value={perPage}
              onChange={handlePerPageChange}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className='text-slate-700 text-sm'>
              {totalAssets}개 중 {startIndex}-{endIndex} 보기
            </span>
          </div>
        </div>
      </div>
      {/* 포트폴리오가 선택되지 않았을 때 안내 메시지 표시 */}
      {!selectedPortfolio && !loading && (
        <div className='text-center py-10 text-gray-500'>
          포트폴리오를 선택해주세요.
        </div>
      )}
    </>
  );
}