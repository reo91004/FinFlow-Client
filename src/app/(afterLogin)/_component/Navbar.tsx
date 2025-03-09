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
import axiosInstance from '@/utils/axiosInstance';
import Swal from 'sweetalert2';
import Profile from '../../../../public/images/profile.jpg';

interface NavbarProps {
  isLoggedIn?: boolean; // optional로 설정하여 기존 코드와의 호환성 유지
}

interface Portfolio {
  portfolio_id: number;
  portfolio_name: string;
  user_id?: number;
}

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn: propIsLoggedIn }: NavbarProps) {
  // Next.js 라우팅 관련
  const pathname = usePathname();
  const router = useRouter();
  const { selectedCurrency, currencies, setCurrency } = useCurrencyStore();

  // 드롭다운 열림 여부 상태
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [portfolioMenuOpen, setPortfolioMenuOpen] = useState(false);

  // 상태 타입 명시
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    null
  );
  const [isLoggedIn, setIsLoggedIn] = useState(propIsLoggedIn || false);
  const [userName, setUserName] = useState('');

  // 로그인 상태 확인 (props에서 받지 않았을 경우만 확인)
  useEffect(() => {
    if (propIsLoggedIn !== undefined) {
      setIsLoggedIn(propIsLoggedIn);
    } else if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    }
  }, [propIsLoggedIn]);

  // 사용자 이름 가져오기
  useEffect(() => {
    if (isLoggedIn && typeof window !== 'undefined') {
      try {
        const userInfoStr = localStorage.getItem('user_info');
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          setUserName(userInfo.name || '사용자');
        }
      } catch (e) {
        console.error('user_info 파싱 실패:', e);
      }
    }
  }, [isLoggedIn]);

  // 로그인 상태일 때만 포트폴리오 불러오기
  useEffect(() => {
    if (isLoggedIn) {
      fetchPortfolios();
    }
  }, [isLoggedIn]);

  // pathname 변경 시 portfolioMenu 닫기
  useEffect(() => {
    setPortfolioMenuOpen(false);
  }, [pathname]);

  // 백엔드 API를 통해 포트폴리오 목록을 가져오는 함수
  const fetchPortfolios = async () => {
    try {
      // 로컬스토리지 접근 전에 브라우저 환경인지 확인
      if (typeof window === 'undefined') return;

      // user_info에서 uid 가져오기 시도
      let uid;
      const userInfoStr = localStorage.getItem('user_info');
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          uid = userInfo.uid;
        } catch (e) {
          console.error('user_info 파싱 실패:', e);
        }
      }

      // 직접 uid 가져오기 시도
      if (!uid) {
        uid = localStorage.getItem('uid');
      }

      // uid가 없으면 (로그인 안된 상태) 무시
      if (!uid) {
        return;
      }

      // 백엔드 라우터: GET /portfolio?user_id=uid
      const response = await axiosInstance.get(`/portfolio?user_id=${uid}`);
      const data = response.data as Portfolio[]; // 타입 단언
      setPortfolios(data);
      if (data && data.length > 0) {
        setSelectedPortfolio(data[0]);
      }
    } catch (error) {
      console.error('포트폴리오 불러오기 에러:', error);
      Swal.fire({
        icon: 'error',
        title: '포트폴리오를 불러오는 중 오류가 발생했습니다.',
        confirmButtonText: '확인',
      });
    }
  };

  // 현재 pathname에 따른 링크 스타일 지정 함수
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

  // 포트폴리오 선택 시 처리
  const handleSelectPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setPortfolioMenuOpen(false);
    localStorage.setItem('selected_portfolio', JSON.stringify(portfolio));
  };

  // 관심 목록 페이지로 이동
  const onClickWatchLists = () => {
    router.push('/watchlists');
  };

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      await axiosInstance.post(`/users/logout?token=${accessToken}`);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('uid');
      localStorage.removeItem('selected_portfolio');

      await Swal.fire({
        title: '로그아웃 되었습니다.',
        icon: 'success',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });

      router.push('/auth/login');
    } catch (error: any) {
      // 로그아웃은 로컬에서 항상 성공해야 함
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('uid');
      localStorage.removeItem('selected_portfolio');

      router.push('/auth/login');
    }
  };

  const onClickAddPortfolio = () => {
    setPortfolioOpen(false);
    router.push('/new-portfolio');
  };

  const onClickManagePortfolios = () => {
    setPortfolioOpen(false);
    router.push('/manage-portfolios');
  };

  return (
    <nav className='fixed top-0 left-0 right-0 h-[4.25rem] bg-white flex justify-between items-center shadow-xl text-sm z-50 px-4 md:px-8 lg:px-16 xl:px-48'>
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

          {isLoggedIn && (
            <>
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
                        <svg
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
                        <span>보유 자산</span>
                      </Link>
                      <Link
                        href='/transactions'
                        className='block px-4 py-2 flex items-center gap-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-[#3699ff]'
                      >
                        <svg
                          width='18'
                          height='18'
                          viewBox='0 0 24 24'
                          version='1.1'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <g
                            id='Stockholm-icons-/-Communication-/-Clipboard-list'
                            stroke='none'
                            strokeWidth='1'
                            fill='none'
                            fillRule='evenodd'
                          >
                            <rect
                              id='bound'
                              x='0'
                              y='0'
                              width='24'
                              height='24'
                            ></rect>
                            <path
                              d='M8,3 L8,3.5 C8,4.32842712 8.67157288,5 9.5,5 L14.5,5 C15.3284271,5 16,4.32842712 16,3.5 L16,3 L18,3 C19.1045695,3 20,3.8954305 20,5 L20,21 C20,22.1045695 19.1045695,23 18,23 L6,23 C4.8954305,23 4,22.1045695 4,21 L4,5 C4,3.8954305 4.8954305,3 6,3 L8,3 Z'
                              id='Combined-Shape'
                              fill='currentColor'
                              opacity='0.3'
                            ></path>
                            <path
                              d='M11,2 C11,1.44771525 11.4477153,1 12,1 C12.5522847,1 13,1.44771525 13,2 L14.5,2 C14.7761424,2 15,2.22385763 15,2.5 L15,3.5 C15,3.77614237 14.7761424,4 14.5,4 L9.5,4 C9.22385763,4 9,3.77614237 9,3.5 L9,2.5 C9,2.22385763 9.22385763,2 9.5,2 L11,2 Z'
                              id='Combined-Shape'
                              fill='currentColor'
                            ></path>
                            <rect
                              id='Rectangle-152'
                              fill='currentColor'
                              opacity='0.3'
                              x='10'
                              y='9'
                              width='7'
                              height='2'
                              rx='1'
                            ></rect>
                            <rect
                              id='Rectangle-152-Copy-2'
                              fill='currentColor'
                              opacity='0.3'
                              x='7'
                              y='9'
                              width='2'
                              height='2'
                              rx='1'
                            ></rect>
                            <rect
                              id='Rectangle-152-Copy-3'
                              fill='currentColor'
                              opacity='0.3'
                              x='7'
                              y='13'
                              width='2'
                              height='2'
                              rx='1'
                            ></rect>
                            <rect
                              id='Rectangle-152-Copy'
                              fill='currentColor'
                              opacity='0.3'
                              x='10'
                              y='13'
                              width='7'
                              height='2'
                              rx='1'
                            ></rect>
                            <rect
                              id='Rectangle-152-Copy-5'
                              fill='currentColor'
                              opacity='0.3'
                              x='7'
                              y='17'
                              width='2'
                              height='2'
                              rx='1'
                            ></rect>
                            <rect
                              id='Rectangle-152-Copy-4'
                              fill='currentColor'
                              opacity='0.3'
                              x='10'
                              y='17'
                              width='7'
                              height='2'
                              rx='1'
                            ></rect>
                          </g>
                        </svg>
                        <span>거래 내역</span>
                      </Link>
                      <Link
                        href='/div-calendar'
                        className='block px-4 py-2 flex items-center gap-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-[#3699ff]'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='18'
                          height='18'
                          viewBox='0 0 24 24'
                          fill='none'
                        >
                          <path
                            opacity='0.3'
                            d='M21 22H3C2.4 22 2 21.6 2 21V5C2 4.4 2.4 4 3 4H21C21.6 4 22 4.4 22 5V21C22 21.6 21.6 22 21 22Z'
                            fill='currentColor'
                          ></path>
                          <path
                            d='M6 6C5.4 6 5 5.6 5 5V3C5 2.4 5.4 2 6 2C6.6 2 7 2.4 7 3V5C7 5.6 6.6 6 6 6ZM11 5V3C11 2.4 10.6 2 10 2C9.4 2 9 2.4 9 3V5C9 5.6 9.4 6 10 6C10.6 6 11 5.6 11 5ZM15 5V3C15 2.4 14.6 2 14 2C13.4 2 13 2.4 13 3V5C13 5.6 13.4 6 14 6C14.6 6 15 5.6 15 5ZM19 5V3C19 2.4 18.6 2 18 2C17.4 2 17 2.4 17 3V5C17 5.6 17.4 6 18 6C18.6 6 19 5.6 19 5Z'
                            fill='currentColor'
                          ></path>
                          <path
                            d='M8.8 13.1C9.2 13.1 9.5 13 9.7 12.8C9.9 12.6 10.1 12.3 10.1 11.9C10.1 11.6 10 11.3 9.8 11.1C9.6 10.9 9.3 10.8 9 10.8C8.8 10.8 8.59999 10.8 8.39999 10.9C8.19999 11 8.1 11.1 8 11.2C7.9 11.3 7.8 11.4 7.7 11.6C7.6 11.8 7.5 11.9 7.5 12.1C7.5 12.2 7.4 12.2 7.3 12.3C7.2 12.4 7.09999 12.4 6.89999 12.4C6.69999 12.4 6.6 12.3 6.5 12.2C6.4 12.1 6.3 11.9 6.3 11.7C6.3 11.5 6.4 11.3 6.5 11.1C6.6 10.9 6.8 10.7 7 10.5C7.2 10.3 7.49999 10.1 7.89999 10C8.29999 9.90003 8.60001 9.80003 9.10001 9.80003C9.50001 9.80003 9.80001 9.90003 10.1 10C10.4 10.1 10.7 10.3 10.9 10.4C11.1 10.5 11.3 10.8 11.4 11.1C11.5 11.4 11.6 11.6 11.6 11.9C11.6 12.3 11.5 12.6 11.3 12.9C11.1 13.2 10.9 13.5 10.6 13.7C10.9 13.9 11.2 14.1 11.4 14.3C11.6 14.5 11.8 14.7 11.9 15C12 15.3 12.1 15.5 12.1 15.8C12.1 16.2 12 16.5 11.9 16.8C11.8 17.1 11.5 17.4 11.3 17.7C11.1 18 10.7 18.2 10.3 18.3C9.9 18.4 9.5 18.5 9 18.5C8.5 18.5 8.1 18.4 7.7 18.2C7.3 18 7 17.8 6.8 17.6C6.6 17.4 6.4 17.1 6.3 16.8C6.2 16.5 6.10001 16.3 6.10001 16.1C6.10001 15.9 6.2 15.7 6.3 15.6C6.4 15.5 6.6 15.4 6.8 15.4C6.9 15.4 7.00001 15.4 7.10001 15.5C7.20001 15.6 7.3 15.6 7.3 15.7C7.5 16.2 7.7 16.6 8 16.9C8.3 17.2 8.6 17.3 9 17.3C9.2 17.3 9.5 17.2 9.7 17.1C9.9 17 10.1 16.8 10.3 16.6C10.5 16.4 10.5 16.1 10.5 15.8C10.5 15.3 10.4 15 10.1 14.7C9.80001 14.4 9.50001 14.3 9.10001 14.3C9.00001 14.3 8.9 14.3 8.7 14.3C8.5 14.3 8.39999 14.3 8.39999 14.3C8.19999 14.3 7.99999 14.2 7.89999 14.1C7.79999 14 7.7 13.8 7.7 13.7C7.7 13.5 7.79999 13.4 7.89999 13.2C7.99999 13 8.2 13 8.5 13H8.8V13.1ZM15.3 17.5V12.2C14.3 13 13.6 13.3 13.3 13.3C13.1 13.3 13 13.2 12.9 13.1C12.8 13 12.7 12.8 12.7 12.6C12.7 12.4 12.8 12.3 12.9 12.2C13 12.1 13.2 12 13.6 11.8C14.1 11.6 14.5 11.3 14.7 11.1C14.9 10.9 15.2 10.6 15.5 10.3C15.8 10 15.9 9.80003 15.9 9.70003C15.9 9.60003 16.1 9.60004 16.3 9.60004C16.5 9.60004 16.7 9.70003 16.8 9.80003C16.9 9.90003 17 10.2 17 10.5V17.2C17 18 16.7 18.4 16.2 18.4C16 18.4 15.8 18.3 15.6 18.2C15.4 18.1 15.3 17.8 15.3 17.5Z'
                            fill='currentColor'
                          ></path>
                        </svg>
                        <span>배당금 달력</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <Link
                href='/community'
                className={getLinkClassName('/community')}
              >
                커뮤니티
              </Link>
            </>
          )}
        </div>
      </div>
      <div className='flex gap-[0.4rem] md:gap-[0.8rem] items-center whitespace-nowrap'>
        <button className='p-1 rounded-md text-[#3699ff] hover:bg-slate-100'>
          <svg
            width='24px'
            height='24px'
            viewBox='0 0 24 24'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
          >
            <defs></defs>
            <g
              id='Stockholm-icons-/-General-/-Search'
              stroke='none'
              strokeWidth='1'
              fill='none'
              fillRule='evenodd'
            >
              <rect id='bound' x='0' y='0' width='24' height='24'></rect>
              <path
                d='M14.2928932,16.7071068 C13.9023689,16.3165825 13.9023689,15.6834175 14.2928932,15.2928932 C14.6834175,14.9023689 15.3165825,14.9023689 15.7071068,15.2928932 L19.7071068,19.2928932 C20.0976311,19.6834175 20.0976311,20.3165825 19.7071068,20.7071068 C19.3165825,21.0976311 18.6834175,21.0976311 18.2928932,20.7071068 L14.2928932,16.7071068 Z'
                id='Path-2'
                fill='currentColor'
                fillRule='nonzero'
                opacity='0.3'
              ></path>
              <path
                d='M11,16 C13.7614237,16 16,13.7614237 16,11 C16,8.23857625 13.7614237,6 11,6 C8.23857625,6 6,8.23857625 6,11 C6,13.7614237 8.23857625,16 11,16 Z M11,18 C7.13400675,18 4,14.8659932 4,11 C4,7.13400675 7.13400675,4 11,4 C14.8659932,4 18,7.13400675 18,11 C18,14.8659932 14.8659932,18 11,18 Z'
                id='Path'
                fill='currentColor'
                fillRule='nonzero'
              ></path>
            </g>
          </svg>
        </button>

        {isLoggedIn ? (
          <>
            <button
              className='p-1 rounded-md text-[#3699ff] hover:bg-slate-100'
              onClick={onClickWatchLists}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  opacity='0.3'
                  d='M7.16973 20.95C6.26973 21.55 5.16972 20.75 5.46972 19.75L7.36973 14.05L2.46972 10.55C1.56972 9.95005 2.06973 8.55005 3.06973 8.55005H20.8697C21.9697 8.55005 22.3697 9.95005 21.4697 10.55L7.16973 20.95Z'
                  fill='currentColor'
                ></path>
                <path
                  d='M11.0697 2.75L7.46973 13.95L16.9697 20.85C17.8697 21.45 18.9697 20.65 18.6697 19.65L13.1697 2.75C12.7697 1.75 11.3697 1.75 11.0697 2.75Z'
                  fill='currentColor'
                ></path>
              </svg>
            </button>
            <div className='relative'>
              <button
                onClick={togglePortfolioDropdown}
                className='flex items-center px-3 py-[0.4rem] rounded-[0.4rem] text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] transition-all'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  className='mr-2'
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
                      d='M20 15H4C2.9 15 2 14.1 2 13V7C2 6.4 2.4 6 3 6H21C21.6 6 22 6.4 22 7V13C22 14.1 21.1 15 20 15ZM13 12H11C10.5 12 10 12.4 10 13V16 C10 16.5 10.4 17 11 17H13C13.6 17 14 16.6 14 16V13C14 12.4 13.6 12 13 12Z'
                      fill='currentColor'
                    ></path>
                    <path
                      d='M14 6V5H10V6H8V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V6H14ZM20 15H14V16C14 16.6 13.5 17 13 17H11C10.5 17 10 16.6 10 16V15H4C3.6 15 3.3 14.9 3 14.7V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V14.7C20.7 14.9 20.4 15 20 15Z'
                      fill='currentColor'
                    ></path>
                  </g>
                </svg>
                <span className='hidden lg:inline'>
                  {selectedPortfolio
                    ? selectedPortfolio.portfolio_name
                    : '선택된 포트폴리오 없음'}
                </span>
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
                  <div className='py-2 max-h-40 overflow-y-auto border-b border-gray-200'>
                    {portfolios && portfolios.length > 0 ? (
                      portfolios.map((portfolio) => (
                        <button
                          key={portfolio.portfolio_id}
                          onClick={() => handleSelectPortfolio(portfolio)}
                          className={`block w-full px-4 py-2 flex items-center text-sm text-slate-600 text-left hover:bg-slate-100 hover:text-[#3699ff] transition-all ${
                            selectedPortfolio &&
                            portfolio.portfolio_id ===
                              selectedPortfolio.portfolio_id
                              ? '!text-[#3699ff]'
                              : ''
                          }`}
                        >
                          {/* 버튼 내용 */}
                          {portfolio.portfolio_name}
                        </button>
                      ))
                    ) : (
                      <div className='px-4 py-2 text-sm text-slate-500'>
                        포트폴리오가 없습니다
                      </div>
                    )}
                  </div>
                  {/* 버튼 영역 추가 */}
                  <div className='py-2 border-t border-gray-200'>
                    <button
                      onClick={onClickAddPortfolio}
                      className='block w-full px-4 py-2 flex items-center gap-2 text-sm text-slate-600 text-left hover:bg-slate-100 hover:text-[#3699ff] transition-all'
                    >
                      <FontAwesomeIcon
                        icon={faPlus as IconProp}
                        className='w-4 h-4'
                      />
                      포트폴리오 추가
                    </button>
                    <button
                      onClick={onClickManagePortfolios}
                      className='block w-full px-4 py-2 flex items-center gap-2 text-sm text-slate-600 text-left hover:bg-slate-100 hover:text-[#3699ff] transition-all'
                    >
                      <FontAwesomeIcon
                        icon={faCog as IconProp}
                        className='w-4 h-4'
                      />
                      포트폴리오 관리
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                        <img
                          src={`/images/currencies/${currency}.png`}
                          width='22'
                          height='22'
                          className='rounded-[0.2rem]'
                        />
                        {currency}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className='relative'>
              <button
                onClick={toggleProfileDropdown}
                className='p-1 rounded-[0.4rem] text-slate-400 hover:bg-slate-100 hover:text-[#3699ff] transition-all'
              >
                <svg
                  width='24px'
                  height='24px'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <g
                    stroke='none'
                    strokeWidth='1'
                    fill='none'
                    fillRule='evenodd'
                  >
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
                    <div className='block w-full px-4 py-2 flex gap-2 items-center border-b'>
                      <Image
                        src={Profile}
                        className='rounded-md'
                        width='32'
                        alt='프로필 이미지'
                      />
                      <span className='text-slate-500 font-semibold truncate'>
                        {userName}
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
          </>
        ) : (
          <Link
            href='/auth/login'
            className='bg-[#3699ff] hover:bg-[#1086ff] px-6 py-3 text-sm text-white rounded-[0.75rem]'
          >
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
