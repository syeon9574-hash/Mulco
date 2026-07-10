export function formatPrice(price: number): string {
  if (price === 0) return '나눔';
  return price.toLocaleString('ko-KR') + '원';
}

export function getCurrentTime(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 || 12;
  return `${ampm} ${h12}:${m}`;
}

export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function resizeAndCompressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  callback: (base64: string) => void
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      callback(compressedDataUrl);
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

export const MAJOR_CITIES = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '수원', '고양', '용인', '성남'
];

export const normalizeRegionToRoom = (regionName: string): string => {
  const n = regionName;

  // 대도시: 시 단위 독립 방 (ALL_ADMIN_ROOMS 에 존재하는 대도시)
  for (const city of MAJOR_CITIES) {
    if (n.includes(city)) {
      // 경기도 광주 vs 광주광역시 구분
      if (city === '광주' && n.includes('경기')) break;
      const suffix = n.includes(city + '시') ? '시' : (n.includes(city + '광역시') ? '광역시' : (n.includes(city + '특별시') ? '특별시' : (n.includes(city + '특별자치시') ? '특별자치시' : '시')));
      return city === '서울' ? '서울특별시' : city === '부산' ? '부산광역시' : city === '대구' ? '대구광역시' : city === '인천' ? '인천광역시' : city === '광주' ? '광주광역시' : city === '대전' ? '대전광역시' : city === '울산' ? '울산광역시' : city === '세종' ? '세종특별자치시' : city + suffix;
    }
  }

  // 제주 -> 제주특별자치도
  if (n.includes('제주') || n.includes('서귀포')) return '제주특별자치도';

  // 경기도 소도시 및 50만 미만 도시 -> 경기도 방으로 흡수
  if (n.includes('경기') || n.includes('의정부') || n.includes('구리') ||
      n.includes('하남') || n.includes('광명') || n.includes('동두천') ||
      n.includes('양주') || n.includes('포천') || n.includes('가평') ||
      n.includes('이천') || n.includes('안성') || n.includes('여주') ||
      n.includes('오산') || n.includes('과천') || n.includes('의왕') ||
      n.includes('화성') || n.includes('부천') || n.includes('남양주') ||
      n.includes('안산') || n.includes('안양') || n.includes('평택') ||
      n.includes('시흥') || n.includes('파주') || n.includes('김포') ||
      (n.includes('광주') && n.includes('경기'))) return '경기도';

  // 강원도 소도시 -> 강원도 방으로 흡수
  if (n.includes('강원') || n.includes('춘천') || n.includes('원주') ||
      n.includes('강릉') || n.includes('동해') || n.includes('태백') ||
      n.includes('속초') || n.includes('삼척') || n.includes('홍천') ||
      n.includes('횡성') || n.includes('영월') || n.includes('평창') ||
      n.includes('정선') || n.includes('철원') || n.includes('화천') ||
      n.includes('양구') || n.includes('인제') || n.includes('양양')) return '강원도';

  // 충청북도 소도시 -> 충청북도 방으로 흡수 (청주 포함)
  if (n.includes('충북') || n.includes('충주') || n.includes('제천') ||
      n.includes('보은') || n.includes('옥천') || n.includes('영동') ||
      n.includes('증평') || n.includes('진천') || n.includes('괴산') ||
      n.includes('음성') || n.includes('단양') || n.includes('청주')) return '충청북도';

  // 충청남도 소도시 -> 충청남도 방으로 흡수 (천안 포함)
  if (n.includes('충남') || n.includes('공주') || n.includes('보령') ||
      n.includes('아산') || n.includes('서산') || n.includes('논산') ||
      n.includes('계룡') || n.includes('당진') || n.includes('금산') ||
      n.includes('부여') || n.includes('서천') || n.includes('청양') ||
      n.includes('홍성') || n.includes('예산') || n.includes('태안') ||
      n.includes('천안')) return '충청남도';

  // 전라북도 소도시 -> 전라북도 방으로 흡수 (전주 포함)
  if (n.includes('전북') || n.includes('군산') || n.includes('익산') ||
      n.includes('정읍') || n.includes('남원') || n.includes('김제') ||
      n.includes('완주') || n.includes('진안') || n.includes('무주') ||
      n.includes('장수') || n.includes('임실') || n.includes('순창') ||
      n.includes('고창') || n.includes('부안') || n.includes('전주')) return '전라북도';

  // 전라남도 소도시 -> 전라남도 방으로 흡수
  if (n.includes('전남') || n.includes('목포') || n.includes('여수') ||
      n.includes('순천') || n.includes('나주') || n.includes('광양') ||
      n.includes('담양') || n.includes('곡성') || n.includes('구례') ||
      n.includes('고흥') || n.includes('보성') || n.includes('화순') ||
      n.includes('장흥') || n.includes('강진') || n.includes('해남') ||
      n.includes('영암') || n.includes('무안') || n.includes('함평') ||
      n.includes('영광') || n.includes('장성') || n.includes('완도') ||
      n.includes('진도') || n.includes('신안')) return '전라남도';

  // 경상북도 소도시 -> 경상북도 방으로 흡수 (포항 포함)
  if (n.includes('경북') || n.includes('경주') || n.includes('김천') ||
      n.includes('안동') || n.includes('구미') || n.includes('영주') ||
      n.includes('영천') || n.includes('상주') || n.includes('문경') ||
      n.includes('경산') || n.includes('군위') || n.includes('의성') ||
      n.includes('청송') || n.includes('영양') || n.includes('영덕') ||
      n.includes('청도') || n.includes('고령') || n.includes('성주') ||
      n.includes('칠곡') || n.includes('예천') || n.includes('봉화') ||
      n.includes('울진') || n.includes('울릉') || n.includes('포항')) return '경상북도';

  // 경상남도 소도시 -> 경상남도 방으로 흡수 (창원, 김해 포함)
  if (n.includes('경남') || n.includes('진주') || n.includes('통영') ||
      n.includes('사천') || n.includes('밀양') || n.includes('거제') ||
      n.includes('양산') || n.includes('의령') || n.includes('함안') ||
      n.includes('창녕') || n.includes('고성') || n.includes('남해') ||
      n.includes('하동') || n.includes('산청') || n.includes('함양') ||
      n.includes('거창') || n.includes('합천') || n.includes('창원') ||
      n.includes('김해')) return '경상남도';

  // 매핑 실패 시 시/도 단어로 광역 매핑 (예: "충청남도 천안시 서북구" → 충청남도)
  const sidoList = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
  for (const sido of sidoList) {
    if (n.includes(sido)) {
      if (sido === '경기') return '경기도';
      if (sido === '강원') return '강원도';
      if (sido === '충북') return '충청북도';
      if (sido === '충남') return '충청남도';
      if (sido === '전북') return '전라북도';
      if (sido === '전남') return '전라남도';
      if (sido === '경북') return '경상북도';
      if (sido === '경남') return '경상남도';
      if (sido === '제주') return '제주특별자치도';
      if (sido === '서울') return '서울특별시';
      if (sido === '부산') return '부산광역시';
      if (sido === '대구') return '대구광역시';
      if (sido === '인천') return '인천광역시';
      if (sido === '광주') return '광주광역시';
      if (sido === '대전') return '대전광역시';
      if (sido === '울산') return '울산광역시';
      if (sido === '세종') return '세종특별자치시';
    }
  }

  return '서울특별시'; // 기본 백업값
};
