// src/app/store/usePortfolioStore.ts
import { create } from 'zustand';
import axiosInstance from '@/utils/axiosInstance';

// 포트폴리오 인터페이스
export interface Portfolio {
  portfolio_id: number;
  portfolio_name: string;
  user_id?: number;
}

// 포트폴리오 스토어 상태 인터페이스
interface PortfolioState {
  // 상태
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  fetchPortfolios: () => Promise<void>;
  selectPortfolio: (portfolio: Portfolio) => void;
  addPortfolio: (portfolioName: string) => Promise<boolean>;
  updatePortfolio: (
    portfolioId: number,
    portfolioName: string
  ) => Promise<boolean>;
  deletePortfolio: (portfolioId: number) => Promise<boolean>;
  reset: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolios: [],
  selectedPortfolio: null,
  isLoading: false,
  error: null,

  // 포트폴리오 목록 가져오기
  fetchPortfolios: async () => {
    // 브라우저 환경인지 확인
    if (typeof window === 'undefined') return;

    // 로그인 상태 확인
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ error: '로그인이 필요합니다.' });
      return;
    }

    try {
      set({ isLoading: true, error: null });

      // user_id 가져오기
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

      // uid가 없으면 오류 반환
      if (!uid) {
        set({
          isLoading: false,
          error: '사용자 정보를 찾을 수 없습니다.',
        });
        return;
      }

      // 백엔드 API 호출
      const response = await axiosInstance.get(`/portfolio?user_id=${uid}`);
      const portfolios = response.data as Portfolio[];

      set({ portfolios, isLoading: false });

      // 현재 선택된 포트폴리오가 없거나, 목록에 존재하지 않는 경우 처리
      const { selectedPortfolio } = get();

      // 로컬스토리지에서 선택된 포트폴리오 가져오기
      const savedPortfolioStr = localStorage.getItem('selected_portfolio');
      let savedPortfolio: Portfolio | null = null;

      if (savedPortfolioStr) {
        try {
          savedPortfolio = JSON.parse(savedPortfolioStr);
        } catch (e) {
          console.error('selected_portfolio 파싱 실패:', e);
        }
      }

      // 선택된 포트폴리오 결정 로직
      if (portfolios.length > 0) {
        // 1. 현재 선택된 포트폴리오가 목록에 있는지 확인
        if (
          selectedPortfolio &&
          portfolios.some(
            (p) => p.portfolio_id === selectedPortfolio.portfolio_id
          )
        ) {
          // 이미 선택된 포트폴리오가 유효하면 유지
          return;
        }

        // 2. 저장된 포트폴리오가 목록에 있는지 확인
        if (
          savedPortfolio &&
          portfolios.some(
            (p) => p.portfolio_id === savedPortfolio?.portfolio_id
          )
        ) {
          set({ selectedPortfolio: savedPortfolio });
          return;
        }

        // 3. 첫 번째 포트폴리오 선택
        const firstPortfolio = portfolios[0];
        set({ selectedPortfolio: firstPortfolio });
        localStorage.setItem(
          'selected_portfolio',
          JSON.stringify(firstPortfolio)
        );
      } else {
        // 포트폴리오가 없는 경우 초기화
        set({ selectedPortfolio: null });
        localStorage.removeItem('selected_portfolio');
      }
    } catch (error) {
      console.error('포트폴리오 불러오기 에러:', error);
      set({
        isLoading: false,
        error: '포트폴리오를 불러오는 중 오류가 발생했습니다.',
      });
    }
  },

  // 포트폴리오 선택
  selectPortfolio: (portfolio: Portfolio) => {
    set({ selectedPortfolio: portfolio });
    localStorage.setItem('selected_portfolio', JSON.stringify(portfolio));
  },

  // 포트폴리오 추가
  addPortfolio: async (portfolioName: string) => {
    // 브라우저 환경인지 확인
    if (typeof window === 'undefined') return false;

    try {
      set({ isLoading: true, error: null });

      // user_id 가져오기
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

      // uid가 없으면 오류 반환
      if (!uid) {
        set({
          isLoading: false,
          error: '사용자 정보를 찾을 수 없습니다.',
        });
        return false;
      }

      // 백엔드 API 호출
      const portfolioData = {
        portfolio_name: portfolioName,
      };

      const response = await axiosInstance.post(
        `/portfolio?user_id=${uid}`,
        portfolioData
      );
      const newPortfolio = response.data as Portfolio;

      // 포트폴리오 목록 업데이트
      const { portfolios } = get();
      const updatedPortfolios = [...portfolios, newPortfolio];

      set({
        portfolios: updatedPortfolios,
        selectedPortfolio: newPortfolio,
        isLoading: false,
      });

      // 로컬스토리지에 선택된 포트폴리오 저장
      localStorage.setItem('selected_portfolio', JSON.stringify(newPortfolio));

      return true;
    } catch (error: any) {
      console.error('포트폴리오 추가 에러:', error);

      // 에러 메시지 처리
      if (error.response) {
        if (error.response.status === 400) {
          set({
            isLoading: false,
            error: '이미 존재하는 포트폴리오 이름입니다.',
          });
        } else {
          set({
            isLoading: false,
            error:
              error.response.data?.detail ||
              '포트폴리오를 추가하는 중 오류가 발생했습니다.',
          });
        }
      } else {
        set({
          isLoading: false,
          error: '포트폴리오를 추가하는 중 오류가 발생했습니다.',
        });
      }

      return false;
    }
  },

  // 포트폴리오 수정
  updatePortfolio: async (portfolioId: number, portfolioName: string) => {
    try {
      set({ isLoading: true, error: null });

      // 백엔드 API 호출
      const response = await axiosInstance.patch(`/portfolio/${portfolioId}`, {
        portfolio_name: portfolioName,
      });

      const updatedPortfolio = response.data as Portfolio;

      // 포트폴리오 목록 업데이트
      const { portfolios, selectedPortfolio } = get();
      const updatedPortfolios = portfolios.map((p) =>
        p.portfolio_id === portfolioId ? updatedPortfolio : p
      );

      // 현재 선택된 포트폴리오가 수정된 포트폴리오인 경우 업데이트
      let newSelectedPortfolio = selectedPortfolio;
      if (selectedPortfolio && selectedPortfolio.portfolio_id === portfolioId) {
        newSelectedPortfolio = updatedPortfolio;
        localStorage.setItem(
          'selected_portfolio',
          JSON.stringify(updatedPortfolio)
        );
      }

      set({
        portfolios: updatedPortfolios,
        selectedPortfolio: newSelectedPortfolio,
        isLoading: false,
      });

      return true;
    } catch (error: any) {
      console.error('포트폴리오 수정 에러:', error);

      if (error.response?.status === 400) {
        set({
          isLoading: false,
          error: '이미 존재하는 포트폴리오 이름입니다.',
        });
      } else {
        set({
          isLoading: false,
          error: '포트폴리오를 수정하는 중 오류가 발생했습니다.',
        });
      }

      return false;
    }
  },

  // 포트폴리오 삭제
  deletePortfolio: async (portfolioId: number) => {
    try {
      set({ isLoading: true, error: null });

      // 백엔드 API 호출
      await axiosInstance.delete(`/portfolio/${portfolioId}`);

      // 포트폴리오 목록 업데이트
      const { portfolios, selectedPortfolio } = get();
      const updatedPortfolios = portfolios.filter(
        (p) => p.portfolio_id !== portfolioId
      );

      // 현재 선택된 포트폴리오가 삭제된 포트폴리오인 경우 처리
      let newSelectedPortfolio = selectedPortfolio;
      if (selectedPortfolio && selectedPortfolio.portfolio_id === portfolioId) {
        // 다른 포트폴리오가 있으면 첫 번째 포트폴리오 선택, 없으면 null
        newSelectedPortfolio =
          updatedPortfolios.length > 0 ? updatedPortfolios[0] : null;

        if (newSelectedPortfolio) {
          localStorage.setItem(
            'selected_portfolio',
            JSON.stringify(newSelectedPortfolio)
          );
        } else {
          localStorage.removeItem('selected_portfolio');
        }
      }

      set({
        portfolios: updatedPortfolios,
        selectedPortfolio: newSelectedPortfolio,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('포트폴리오 삭제 에러:', error);
      set({
        isLoading: false,
        error: '포트폴리오를 삭제하는 중 오류가 발생했습니다.',
      });

      return false;
    }
  },

  // 상태 초기화 (로그아웃 시 등)
  reset: () => {
    set({
      portfolios: [],
      selectedPortfolio: null,
      isLoading: false,
      error: null,
    });
  },
}));
