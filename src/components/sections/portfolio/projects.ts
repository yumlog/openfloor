export interface PortfolioProject {
  brand: string
  project: string
  desc: string
  image: string
  logo: string
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    brand: '올리브영',
    project: 'Smart PDA 구축 및 운영',
    desc: '기존 Back Room 중심으로 처리되던\n입출고, 라벨, 테스터, 재고 관리 업무를\nPDA 기반의 현장 업무 시스템으로 전환하여\n운영 편의성과 확장성을 확보했습니다.',
    image: '/images/slide-pda.png',
    logo: '/images/logo-oliveyoung.svg',
  },
  {
    brand: '올리브영',
    project: '올영 샐리 개발 및 운영',
    desc: '매장 직원의 판매 활동을 지원하기 위해\n성분, 원료 등 상품 상세 정보를 활용하여\n고객의 피부 타입과 니즈에 맞는\n상품 추천 서비스를 구축·운영했습니다.',
    image: '/images/slide-oliveyoung.png',
    logo: '/images/logo-oliveyoung.svg',
  },
  {
    brand: 'KB 금융지주',
    project: 'IR 활동 분석 및 인사이트 제공 시스템',
    desc: 'IR 활동 데이터와 투자자 정보를 연결하여\n투자자 대응에 필요한 인사이트를 도출하고,\n분기별 트렌드 대시보드와 맞춤형 리포트로\n효율적인 IR 의사결정을 지원했습니다.',
    image: '/images/slide-kb.png',
    logo: '/images/logo-kb.svg',
  },
  {
    brand: 'KIT 경남정보대학교',
    project: '유학생 통합 관리 시스템 구축',
    desc: '유학생 모집부터 학사 관리까지 이어지는\n전주기 관리 프로세스를 지원하고,\n비자, 학사, 장학, 성적, 상담 정보를 통합하여\n어학당 운영의 효율성을 높였습니다.',
    image: '/images/slide-kit.png',
    logo: '/images/logo-kit.svg',
  },
]
