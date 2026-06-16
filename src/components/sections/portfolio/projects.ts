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
    desc: '백-룸에서만 진행 되어 왔던 매장 내 업무(입/출고, 라벨, 테스터 상품, 재고 등)의 한계를 PDA 바탕으로 전환하여 다양한 편의 및 확장성을 제공',
    image: '/images/slide-pda.png',
    logo: '/images/logo-oliveyoung.svg',
  },
  {
    brand: '올리브영',
    project: '올영 샐리 개발 및 운영',
    desc: '매장 직원들의 판매 활동을 돕기 위한 서비스로\n상품에 있는 성분, 원료 등의 상세 내용 및 고객\n피부 타입에 맞는 상품을 추천하기 위한 서비스',
    image: '/images/slide-oliveyoung.png',
    logo: '/images/logo-oliveyoung.svg',
  },
  {
    brand: 'KB 금융지주',
    project: 'IR 활동 기반 인사이트 분석 시스템',
    desc: 'IR 활동과 투자자 데이터를 연결해 인사이트를 도출하고, 트렌드 분석 대시보드와 타깃 맞춤형 리포트를 통해 효과적인 투자자 커뮤니케이션을 지원.',
    image: '/images/slide-kb.png',
    logo: '/images/logo-kb.svg',
  },
  {
    brand: 'KIT 경남정보대학교',
    project: 'KIT 유학생 통합 관리 시스템',
    desc: '유학생 전 주기를 통합 관리하기 위한 플랫폼으로\n학생·비자·학사·장학 등 분산된 정보를 하나의\n시스템에서 통합 관리하여 효율을 높일 수 있는 서비스',
    image: '/images/slide-kit.png',
    logo: '/images/logo-kit.svg',
  },
]
