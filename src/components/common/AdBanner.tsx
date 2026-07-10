import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface AdBannerProps {
  // 1. Web/PC (Google AdSense) IDs
  adSenseClient?: string; // e.g., "ca-pub-1234567890123456"
  adSenseSlot?: string;   // e.g., "9876543210"

  // 2. Native Mobile App (Google AdMob) IDs
  adMobAndroidAdUnitId?: string; // Android AdMob Banner AdUnit ID
  adMobIosAdUnitId?: string;     // iOS AdMob Banner AdUnit ID

  // 3. Platform override for testing
  // 'auto' automatically detects Capacitor Native App vs Web browser (PC/Mobile Web)
  platform?: 'auto' | 'mock' | 'web' | 'native';
  height?: number;
}

interface MockAd {
  tag: string;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  tagColor: string;
  icon: string;
  link: string;
}

const mockAds: MockAd[] = [
  {
    tag: '이벤트',
    title: '물생활 전문 쇼핑몰 [아쿠아팜]',
    subtitle: '물꼬 회원 가입 시 전 상품 10% 즉시 할인 쿠폰 지급! 🐠',
    bgColor: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    textColor: '#ffffff',
    tagColor: '#ffd700',
    icon: 'local_activity',
    link: 'https://example.com/aquafarm'
  },
  {
    tag: '안내',
    title: '물꼬 프리미엄 멤버십 출시 예정 🔒',
    subtitle: '광고 없는 화면과 3개 이상의 무제한 동네방 등록 혜택을 만나보세요.',
    bgColor: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    textColor: '#ffffff',
    tagColor: '#FF8E9E',
    icon: 'workspace_premium',
    link: 'https://example.com/premium'
  },
  {
    tag: '꿀팁',
    title: '초보 집사를 위한 물잡이 백과사전 📖',
    subtitle: '물고기가 아프신가요? 환수 주기부터 질병 대처법까지 확인하세요.',
    bgColor: 'linear-gradient(135deg, #eaf9f5 0%, #f0f7f4 100%)',
    textColor: '#2e6a4f',
    tagColor: '#2e6a4f',
    icon: 'menu_book',
    link: 'https://example.com/guide'
  }
];

// Styled Components
const BannerWrapper = styled.div<{ $height: number }>`
  width: 100%;
  height: ${props => props.$height}px;
  background-color: ${props => props.theme.colors.white};
  border-top: 1px solid ${props => props.theme.colors.muted};
  border-bottom: 1px solid ${props => props.theme.colors.muted};
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  user-select: none;
  box-sizing: border-box;
`;

const slideUp = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  8% { transform: translateY(0); opacity: 1; }
  92% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-100%); opacity: 0; }
`;

const MockAdContainer = styled.a<{ $bgColor: string; $textColor: string }>`
  width: 100%;
  height: 100%;
  background: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  display: flex;
  align-items: center;
  padding: 0 16px;
  text-decoration: none;
  font-size: 0.78rem;
  box-sizing: border-box;
  gap: 12px;
  cursor: pointer;
  animation: ${slideUp} 6s infinite ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
`;

const AdTag = styled.span<{ $tagColor: string; $textColor: string }>`
  background-color: ${props => props.$tagColor}15;
  border: 1px solid ${props => props.$tagColor};
  color: ${props => props.$tagColor};
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  letter-spacing: -0.5px;
`;

const AdContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

const AdTitle = styled.div`
  font-weight: 700;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AdSubtitle = styled.div`
  font-size: 0.7rem;
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AdIcon = styled.span`
  font-family: 'Material Symbols Rounded';
  font-size: 20px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AdBanner: React.FC<AdBannerProps> = ({
  adSenseClient,
  adSenseSlot,
  adMobAndroidAdUnitId,
  adMobIosAdUnitId,
  platform = 'auto',
  height = 50
}) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [resolvedPlatform, setResolvedPlatform] = useState<'mock' | 'web' | 'native'>('mock');

  const win = window as any;
  const isAndroid = win.Capacitor?.platform === 'android';
  const isIos = win.Capacitor?.platform === 'ios';
  const activeAdMobId = isAndroid ? adMobAndroidAdUnitId : isIos ? adMobIosAdUnitId : undefined;

  // Detect platform mode
  useEffect(() => {
    if (platform !== 'auto') {
      setResolvedPlatform(platform === 'native' ? 'native' : platform === 'web' ? 'web' : 'mock');
      return;
    }

    // Auto-detect environment
    const isCapacitorNative = !!(win.Capacitor && win.Capacitor.isNativePlatform);

    if (isCapacitorNative && activeAdMobId) {
      setResolvedPlatform('native');
    } else if (adSenseClient && adSenseSlot) {
      setResolvedPlatform('web');
    } else {
      setResolvedPlatform('mock');
    }
  }, [platform, adSenseClient, adSenseSlot, activeAdMobId]);

  // Rotator for Mock Ads
  useEffect(() => {
    if (resolvedPlatform !== 'mock') return;
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % mockAds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [resolvedPlatform]);

  // Google AdSense Loader (Web / PC)
  useEffect(() => {
    if (resolvedPlatform !== 'web' || !adSenseClient) return;

    const scriptId = 'google-adsense-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClient}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    }

    const win = window as any;
    try {
      (win.adsbygoogle = win.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('Google AdSense push failed:', e);
    }
  }, [resolvedPlatform, adSenseClient]);

  // Google AdMob Loader (Native Mobile App)
  useEffect(() => {
    if (resolvedPlatform !== 'native' || !activeAdMobId) return;

    const win = window as any;
    const AdMobPlugin = win.Capacitor?.Plugins?.AdMob;

    if (!AdMobPlugin) {
      console.info('AdMob Plugin not found on window.Capacitor. Normal in Web test mode.');
      return;
    }

    // Initialize and display native AdMob banner
    const initAndShowNativeAd = async () => {
      try {
        await AdMobPlugin.initialize({
          requestTrackingAuthorization: true,
        });

        // Show banner at the bottom of the native webview
        await AdMobPlugin.showBanner({
          adId: activeAdMobId,
          adSize: 'BANNER', // 320x50 standard banner
          position: 'BOTTOM_CENTER',
          margin: 0,
          isTesting: false // Set to true when debugging, false for production
        });
      } catch (e) {
        console.warn('Failed to render native AdMob banner:', e);
      }
    };

    initAndShowNativeAd();

    // Clean up native banner on unmount
    return () => {
      try {
        AdMobPlugin.removeBanner();
      } catch (e) {}
    };
  }, [resolvedPlatform, activeAdMobId]);

  // Render Logic
  if (resolvedPlatform === 'native') {
    // Return empty placeholder because Native AdMob SDK renders the banner as an overlay on top of the webview
    return <div style={{ width: '100%', height: `${height}px`, backgroundColor: 'transparent' }} />;
  }

  if (resolvedPlatform === 'web' && adSenseClient && adSenseSlot) {
    return (
      <BannerWrapper $height={height} style={{ justifyContent: 'center' }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '100%', height: `${height}px` }}
          data-ad-client={adSenseClient}
          data-ad-slot={adSenseSlot}
        />
      </BannerWrapper>
    );
  }

  // Fallback Mock Advertisement
  const activeAd = mockAds[currentAdIndex];
  return (
    <BannerWrapper $height={height}>
      <MockAdContainer
        key={currentAdIndex}
        href={activeAd.link}
        target="_blank"
        rel="noopener noreferrer"
        $bgColor={activeAd.bgColor}
        $textColor={activeAd.textColor}
      >
        <AdTag $tagColor={activeAd.tagColor} $textColor={activeAd.textColor}>
          {activeAd.tag}
        </AdTag>
        <AdContent>
          <AdTitle>{activeAd.title}</AdTitle>
          <AdSubtitle>{activeAd.subtitle}</AdSubtitle>
        </AdContent>
        <AdIcon>{activeAd.icon}</AdIcon>
      </MockAdContainer>
    </BannerWrapper>
  );
};
