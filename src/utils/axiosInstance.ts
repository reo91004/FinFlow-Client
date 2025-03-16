import axios from 'axios';

// 백엔드 API 서버 주소를 .env 혹은 환경변수에서 가져온다고 가정
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 필요하다면 쿠키 기반 인증을 사용할 때
  // withCredentials: true,

  // 요청 제한 시간 설정 (필요 시)
  // timeout: 5000,
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 클라이언트에서만 localStorage 사용 가능
    if (typeof window !== 'undefined') {
      // Finnhub API 또는 exchangerate-api 요청인 경우 Authorization 헤더를 추가하지 않음
      if (
        config.url &&
        (config.url.includes('finnhub.io') ||
          config.url.includes('exchangerate-api.com'))
      ) {
        // 외부 API는 Authorization 헤더를 사용하지 않으므로 제외
        // Authorization 헤더가 이미 있다면 제거
        if (config.headers && config.headers.Authorization) {
          delete config.headers.Authorization;
        }
        return config;
      }

      const token = localStorage.getItem('access_token');
      if (token) {
        // 백엔드가 Bearer 토큰 방식을 쓴다면
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    // 응답 데이터 가공이 필요하다면 여기서 처리
    return response;
  },
  (error) => {
    // 에러 처리 로직 (예: 토큰 만료 시 로그아웃 등)
    return Promise.reject(error);
  }
);

export default axiosInstance;
