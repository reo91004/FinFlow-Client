import { useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// 투자 성향 타입 정의
const INVESTMENT_PROFILES = [
  {
    value: '안정형',
    label: '안정형',
    description: '원금 보존이 최우선, 낮은 위험을 선호',
  },
  {
    value: '안정추구형',
    label: '안정추구형',
    description: '원금 보존을 중시하며 약간의 수익 추구',
  },
  {
    value: '위험중립형',
    label: '위험중립형',
    description: '적절한 수익과 위험의 균형을 추구',
  },
  {
    value: '적극투자형',
    label: '적극투자형',
    description: '높은 수익을 위해 어느 정도 위험 감수 가능',
  },
  {
    value: '공격투자형',
    label: '공격투자형',
    description: '최대 수익을 위해 높은 위험도 감수',
  },
];

interface InvestmentProfileModalProps {
  onClose?: () => void;
}

export default function InvestmentProfileModal({
  onClose,
}: InvestmentProfileModalProps) {
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!selectedProfile) {
      Swal.fire({
        title: '투자 성향을 선택해주세요',
        icon: 'warning',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 로컬스토리지에서 유저 정보와 토큰 가져오기
      const userInfoStr = localStorage.getItem('user_info');
      if (!userInfoStr) {
        throw new Error('유저 정보를 찾을 수 없습니다');
      }

      const userInfo = JSON.parse(userInfoStr);
      const userId = userInfo.uid;

      console.log('투자 성향 업데이트 요청:', {
        userId,
        investment_profile: selectedProfile,
      });

      // 사용자의 투자 성향 업데이트 - 쿼리 파라미터로 token 전달
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.patch(
        `/users/${userId}?token=${token}`,
        { investment_profile: selectedProfile }
      );

      console.log('투자 성향 업데이트 응답:', response.data);

      // 로컬스토리지의 user_info도 업데이트
      userInfo.investment_profile = selectedProfile;
      localStorage.setItem('user_info', JSON.stringify(userInfo));

      // 성공 메시지 표시
      await Swal.fire({
        title: '투자 성향이 설정되었습니다',
        icon: 'success',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });

      // 모달 닫기 및 홈으로 이동
      if (onClose) onClose();
      router.push('/');
    } catch (error: any) {
      console.error('투자 성향 설정 오류:', error);

      // 응답 에러 상세 정보 로깅
      if (error.response) {
        console.error('응답 데이터:', error.response.data);
        console.error('응답 상태:', error.response.status);
        console.error('응답 헤더:', error.response.headers);
      }

      // 사용자에게 더 자세한 에러 메시지 표시
      Swal.fire({
        title: '오류가 발생했습니다',
        text:
          error.response?.data?.detail ||
          '투자 성향을 설정하는 중 문제가 발생했습니다. 다시 시도해 주세요.',
        icon: 'error',
        confirmButtonText: '확인',
        confirmButtonColor: '#3699ff',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className='fixed inset-0 bg-black/40 z-[100]'></div>
      <div className='fixed top-1/2 left-1/2 z-[110] w-full max-w-lg -translate-x-1/2 -translate-y-1/2'>
        <div className='bg-white rounded-lg shadow-xl p-6 animate-fade-in-down'>
          <div className='pb-4 mb-6 border-b'>
            <h2 className='text-xl font-semibold text-slate-700'>
              투자 성향 설정
            </h2>
            <p className='text-sm text-slate-500 mt-2'>
              투자 스타일에 맞는 투자 성향을 선택해 주세요. 이 정보는 향후 추천
              서비스에 활용됩니다.
            </p>
          </div>

          <div className='space-y-4 mb-6'>
            {INVESTMENT_PROFILES.map((profile) => (
              <div
                key={profile.value}
                className={`p-4 border rounded-md cursor-pointer transition-all ${
                  selectedProfile === profile.value
                    ? 'border-[#3699ff] bg-[#e1f0ff]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedProfile(profile.value)}
              >
                <div className='flex items-center'>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedProfile === profile.value
                        ? 'border-[#3699ff]'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedProfile === profile.value && (
                      <div className='w-3 h-3 bg-[#3699ff] rounded-full'></div>
                    )}
                  </div>
                  <div className='ml-3'>
                    <h3 className='font-medium text-slate-700'>
                      {profile.label}
                    </h3>
                    <p className='text-sm text-slate-500'>
                      {profile.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='flex justify-end space-x-3'>
            <button
              className='px-6 py-3 bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-500 rounded-md transition-all'
              onClick={onClose}
              disabled={isSubmitting}
            >
              나중에 설정
            </button>
            <button
              className='px-6 py-3 bg-[#3699ff] hover:bg-[#187de4] text-sm font-semibold text-white rounded-md transition-all disabled:opacity-70'
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '설정 중...' : '설정 완료'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
