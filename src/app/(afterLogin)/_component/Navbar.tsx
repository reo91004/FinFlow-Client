'use client';

import Image from 'next/image';
import Logo from '../../../../public/images/logo.png';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCurrencyStore } from '@/app/store/currency';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPlus } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import axiosInstance from '@/utils/axiosInstance'; // 백엔드 연동용
import Swal from 'sweetalert2';
import Profile from '../../../../public/images/profile.jpg';

export default function Navbar() {
  // 라우팅 관련
  const pathname = usePathname();
  const router = useRouter();

  // 통화(스토어)
  const { selectedCurrency, currencies, setCurrency } = useCurrencyStore();

  // 드롭다운 열림 여부
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [portfolioMenuOpen, setPortfolioMenuOpen] = useState(false);

  // 1) 포트폴리오 목록을 서버에서 받아오기 위해 상태 변경
  const [portfolios, setPortfolios] = useState([]); // 처음엔 빈 배열
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);

  // 마운트 시 포트폴리오 조회
  useEffect(() => {
    fetchPortfolios();
  }, []);

  // pathname 변경 시 포트폴리오 메뉴 닫기
  useEffect(() => {
    setPortfolioMenuOpen(false);
  }, [pathname]);

  // 포트폴리오 API 연동 로직
  const fetchPortfolios = async () => {
    try {
      // (예시) 현재 사용자 uid를 localStorage에서 가져온다고 가정
      const uid = localStorage.getItem('uid');
      // 백엔드 URL 예시: GET /portfolios?userId=uid
      // 혹은 /users/{uid}/portfolios 등 실제 API 경로에 맞춰 수정
      const response = await axiosInstance.get(`/portfolios?userId=${uid}`);

      // 백엔드가 [ { portfolio_id, portfolio_name, user_id, ... }, ... ] 형태로 준다고 가정
      const data = response.data;

      setPortfolios(data);

      // 기본적으로 첫 번째 포트폴리오를 선택 상태로
      if (data && data.length > 0) {
        setSelectedPortfolio(data[0]);
      }
    } catch (error) {
      console.error('포트폴리오 불러오기 에러:', error);
      // 에러 처리 (예: Swal 등)
      Swal.fire({
        icon: 'error',
        title: '포트폴리오를 불러오는 중 오류가 발생했습니다.',
        confirmButtonText: '확인',
      });
    }
  };

  // 링크 css 구분
  const getLinkClassName = (paths: string | string[]) => {
    if (Array.isArray(paths)) {
      return paths.includes(pathname)
        ? 'px-3 py-[0.4rem] rounded-[0.4rem] bg-slate-100 text-[#3699ff]'
        : 'px-3 py-[0.4rem] rounded-[0.4rem] text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] transition-all';
    }
    return pathname === paths
      ? 'px-3 py-[0.4rem] rounded-[0.4rem] bg-slate-100 text-[#3699ff]'
      : 'px-3 py-[0.4rem] rounded-[0.4rem] text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] transition-all';
  };

  // 드롭다운 토글 함수들
  const toggleCurrencyDropdown = () => {
    setCurrencyOpen(!currencyOpen);
    setProfileOpen(false);
    setPortfolioOpen(false);
  };
  const toggleProfileDropdown = () => {
    setProfileOpen(!profileOpen);
    setCurrencyOpen(false);
    setPortfolioOpen(false);
  };
  const togglePortfolioDropdown = () => {
    setPortfolioOpen(!portfolioOpen);
    setCurrencyOpen(false);
    setProfileOpen(false);
  };
  const togglePortfolioMenu = () => {
    setPortfolioMenuOpen(!portfolioMenuOpen);
  };

  // 포트폴리오 선택
  const handleSelectPortfolio = (portfolio: any) => {
    setSelectedPortfolio(portfolio);
    setPortfolioMenuOpen(false);
    // 필요하면 다른 로직(페이지 이동 등) 추가
  };

  // 관심 목록 이동
  const onClickWatchLists = () => {
    router.push('/watchlists');
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      await axiosInstance.post(`/users/logout?token=${accessToken}`);
      localStorage.removeItem('access_token');
      router.push('/auth/login');
    } catch (error: any) {
      await Swal.fire({
        title: '로그아웃 중 오류가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });
    }
  };

  // selectedPortfolio가 아직 없을 수도 있으니 안전하게 처리
  const selectedPortfolioName =
    selectedPortfolio?.portfolio_name || '포트폴리오';

  return (
    <nav className='fixed top-0 left-0 right-0 h-[4.25rem] bg-white flex justify-between items-center shadow-xl text-sm z-50 px-4 md:px-8 lg:px-16 xl:px-48'>
      {/* 좌측 로고 / 메뉴 */}
      <div className='flex gap-[1rem] md:gap-[2rem] items-center whitespace-nowrap'>
        <Link href='/'>
          <Image src={Logo} alt='logo' width={64} />
        </Link>
        <div className='hidden lg:flex gap-[1rem] md:gap-[2rem] items-center'>
          <Link href='/' className={getLinkClassName('/')}>
            홈
          </Link>
          <Link href='/news' className={getLinkClassName('/news')}>
            뉴스
          </Link>
          <Link href='/stats' className={getLinkClassName('/stats')}>
            분석
          </Link>
          {/* 포트폴리오 관련 드롭다운 (상단 메뉴) */}
          <div className='relative'>
            <button
              onClick={togglePortfolioMenu}
              className={`flex items-center ${getLinkClassName([
                '/assets',
                '/transactions',
                '/div-calendar',
              ])}`}
            >
              포트폴리오
              <svg
                className={`ml-1 size-4 text-current transition-transform ${
                  portfolioMenuOpen ? 'rotate-180' : ''
                }`}
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
            {portfolioMenuOpen && (
              <div className='absolute left-0 mt-4 w-40 rounded-[0.5rem] bg-white shadow-xl'>
                <div className='py-1'>
                  <Link
                    href='/assets'
                    className='block px-4 py-2 flex items-center gap-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-[#3699ff]'
                  >
                    {/* ... 보유 자산 아이콘 ... */}
                    <span>보유 자산</span>
                  </Link>
                  <Link
                    href='/transactions'
                    className='block px-4 py-2 flex items-center gap-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-[#3699ff]'
                  >
                    {/* ... 거래 내역 아이콘 ... */}
                    <span>거래 내역</span>
                  </Link>
                  <Link
                    href='/div-calendar'
                    className='block px-4 py-2 flex items-center gap-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-[#3699ff]'
                  >
                    {/* ... 배당금 달력 아이콘 ... */}
                    <span>배당금 달력</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link href='/community' className={getLinkClassName('/community')}>
            커뮤니티
          </Link>
        </div>
      </div>

      {/* 우측 아이콘 / 드롭다운들 */}
      <div className='flex gap-[0.4rem] md:gap-[0.8rem] items-center whitespace-nowrap'>
        {/* 검색 버튼 (예시) */}
        <button className='p-1 rounded-md text-[#3699ff] hover:bg-slate-100'>
          {/* 검색 아이콘 */}
          <svg
            width='24px'
            height='24px'
            viewBox='0 0 24 24'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
          >
            {/* ... */}
          </svg>
        </button>

        {/* 관심목록 버튼 */}
        <button
          className='p-1 rounded-md text-[#3699ff] hover:bg-slate-100'
          onClick={onClickWatchLists}
        >
          {/* 관심목록 아이콘 */}
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            {/* ... */}
          </svg>
        </button>

        {/* 포트폴리오 목록 드롭다운 (우측) */}
        <div className='relative'>
          <button
            onClick={togglePortfolioDropdown}
            className='flex items-center px-3 py-[0.4rem] rounded-[0.4rem] text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] transition-all'
          >
            {/* 선택된 포트폴리오 이름 표시 */}
            {selectedPortfolioName}
            <svg
              className={`-mr-1 size-5 text-gray-400 transition-transform ${
                portfolioOpen ? 'rotate-180' : ''
              }`}
              viewBox='0 0 20 20'
              fill='currentColor'
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z'
                clipRule='evenodd'
              />
            </svg>
          </button>
          {portfolioOpen && (
            <div
              className='absolute right-0 mt-1 w-64 rounded-[0.5rem] bg-white shadow-xl'
              style={{ maxHeight: '300px' }}
            >
              {/* 포트폴리오 목록 */}
              <div className='py-2 max-h-40 overflow-y-auto border-b border-gray-200'>
                {portfolios.map((portfolio: any) => (
                  <button
                    key={portfolio.portfolio_id}
                    onClick={() => handleSelectPortfolio(portfolio)}
                    className={`block w-full px-4 py-2 flex items-center text-sm text-slate-600 text-left hover:bg-slate-100 hover:text-[#3699ff] transition-all ${
                      portfolio.portfolio_id === selectedPortfolio?.portfolio_id
                        ? '!text-[#3699ff]'
                        : ''
                    }`}
                  >
                    {portfolio.portfolio_name}
                  </button>
                ))}
              </div>
              {/* 포트폴리오 추가 / 관리 버튼 */}
              <div className='flex justify-center items-center gap-2 p-3'>
                <button
                  className='bg-[#e1f0ff] hover:bg-[#3699ff] text-[#3699ff] hover:text-white px-3.5 py-2 text-sm rounded-[0.5rem] transition-all'
                  onClick={() => alert('포트폴리오 추가 기능')}
                >
                  <FontAwesomeIcon icon={faPlus as IconProp} className='pr-2' />
                  추가
                </button>
                <button
                  className='bg-[#e1f0ff] hover:bg-[#3699ff] text-[#3699ff] hover:text-white px-3.5 py-2 text-sm rounded-[0.5rem] transition-all'
                  onClick={() => alert('포트폴리오 관리 페이지 이동')}
                >
                  <FontAwesomeIcon icon={faCog as IconProp} className='pr-2' />
                  관리
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 통화(USD/KRW 등) 선택 드롭다운 */}
        <div className='relative'>
          <button
            onClick={toggleCurrencyDropdown}
            className='flex items-center px-3 py-[0.4rem] rounded-[0.4rem] text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] transition-all'
          >
            {selectedCurrency}
            <svg
              className={`-mr-1 size-5 text-gray-400 transition-transform ${
                currencyOpen ? 'rotate-180' : ''
              }`}
              viewBox='0 0 20 20'
              fill='currentColor'
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z'
                clipRule='evenodd'
              />
            </svg>
          </button>
          {currencyOpen && (
            <div
              className='absolute right-0 mt-1 w-32 rounded-[0.5rem] bg-white shadow-xl overflow-y-auto'
              style={{ maxHeight: '200px' }}
            >
              <div className='py-1' role='menu'>
                {currencies.map((currency) => (
                  <button
                    key={currency}
                    onClick={() => {
                      setCurrency(currency);
                      setCurrencyOpen(false);
                    }}
                    className='block w-full px-4 py-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] text-left flex gap-2'
                    role='menuitem'
                  >
                    {/* 통화 아이콘이 있다면 img 혹은 Icon */}
                    {currency}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 프로필 드롭다운 */}
        <div className='relative'>
          <button
            onClick={toggleProfileDropdown}
            className='p-1 rounded-[0.4rem] text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] transition-all'
          >
            {/* 프로필 아이콘 */}
            <svg
              width='24px'
              height='24px'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                <path
                  d='M12,11 C9.79,11 8,9.21 8,7 C8,4.79 9.79,3 12,3 C14.21,3 16,4.79 16,7 C16,9.21 14.21,11 12,11 Z'
                  fill='currentColor'
                  opacity='0.3'
                ></path>
                <path
                  d='M3,20.2 C3.39,15.43 7.26,13 11.98,13 C16.77,13 20.7,15.29 21,20.2 C21.01,20.4 21,21 20.25,21 C16.54,21 11.03,21 3.72,21 C3.48,21 2.98,20.46 3,20.2 Z'
                  fill='currentColor'
                ></path>
              </g>
            </svg>
          </button>
          {profileOpen && (
            <div className='absolute right-0 mt-1 w-52 rounded-[0.5rem] bg-white shadow-xl'>
              <div className='py-1' role='menu'>
                {/* 프로필: 이미지 + 닉네임 (예시) */}
                <div className='block w-full px-4 py-2 flex gap-2 items-center border-b'>
                  <Image
                    src={Profile}
                    className='rounded-md'
                    width='32'
                    alt='프로필 이미지'
                  />
                  <span className='text-slate-500 font-semibold truncate'>
                    테스트
                  </span>
                </div>
                <Link
                  href='/user-profile'
                  className='block w-full px-4 py-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] text-left'
                >
                  내 계정
                </Link>
                <button
                  className='block w-full px-4 py-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] text-left'
                  role='menuitem'
                >
                  알림
                </button>
                <Link
                  href='/faq'
                  className='block w-full px-4 py-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] text-left'
                >
                  FAQ
                </Link>
                <button
                  className='block w-full px-4 py-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] text-left'
                  role='menuitem'
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
