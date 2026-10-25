import { useEffect, useRef } from 'react';

/**
 * Custom hook tải và khởi tạo Facebook JavaScript SDK
 */
export function useFacebookLogin({ appId, onSuccess, onError }) {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!appId || isInitialized.current) return;

    // Định nghĩa callback khởi tạo FB SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v19.0',
      });
      isInitialized.current = true;
    };

    // Tải script FB SDK nếu chưa có
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/vi_VN/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [appId]);

  const login = () => {
    if (!window.FB) {
      onError?.(new Error('Facebook SDK chưa sẵn sàng. Vui lòng thử lại sau vài giây.'));
      return;
    }

    window.FB.login(
      (response) => {
        if (response.authResponse && response.authResponse.accessToken) {
          onSuccess?.(response.authResponse);
        } else {
          onError?.(new Error('Người dùng đã hủy đăng nhập Facebook hoặc chưa cấp quyền.'));
        }
      },
      { scope: 'public_profile,email' }
    );
  };

  return { login };
}

