// src/app/(afterLogin)/layout.tsx
'use client';

import Navbar from './_component/Navbar';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// 로그인이 필수인 경로 목록
const PROTECTED_ROUTES = [
  '/assets',
  '/transactions',
  '/manage-portfolios',
  '/new-portfolio',
  '/user-profile',
];

export default function AfterLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(!!token);

      // 현재 경로가 보호된 경로이고 로그인하지 않은 경우에만 리다이렉트
      if (
        !token &&
        PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
      ) {
        router.push('/auth/login');
      }

      setChecking(false);
    }
  }, [router, pathname]);

  // 로그인 확인 중인 동안에만 로딩 표시
  if (checking) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar isLoggedIn={isAuthenticated} />
      <main className='min-h-screen px-4 md:px-8 lg:px-16 xl:px-48 pt-24 lg:pt-36 bg-[#f9fafb]'>
        {children}
      </main>
    </div>
  );
}
