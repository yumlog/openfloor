# OPENFLOOR

회사 소개 사이트. 단일 motion value로 구동되는 **싱글 페이지 · 풀스크린 스크롤
스냅** 경험.

## 1. 프로젝트 개요

OPENFLOOR는 한 화면에 한 섹션씩 스냅되는 풀스크린 스크롤 사이트다. 휠 · 터치 ·
키보드 제스처를 가로채 "한 제스처 = 한 섹션"으로 이동하며, 모든 애니메이션은
하나의 `slide` motion value(`0, 1, 2 …`)에서 `useTransform`으로 파생된다.

- **단일 진실 공급원:** 하나의 `slide` 값이 트랙 이동 · 배경 크로스페이드 ·
  스크롤스파이 · 섹션별 애니메이션을 모두 구동한다.
- **풀스크린 스냅:** 각 섹션은 정확히 한 화면(`100dvh`) 높이이며, 스크롤 엔진이
  데스크탑 · 모바일 모두에서 섹션 단위로 스냅한다.
- **유동 스케일 반응형:** 1440px 디자인을 기준으로 그 아래에서는 프레임 너비에
  비례해 축소되고, 모바일(`<768px`)은 별도 전용 레이아웃으로 reflow된다.
- **3D 크리스탈:** hero → about 구간에 three.js 기반 부유 크리스탈을 합성한다.

**섹션 순서(7 슬라이드):** Hero → About → Philosophy → Vision → Portfolio →
Manifesto → Contact (+ Footer).

> 섹션을 추가/변경하려면 `src/config/slides.ts`의 `SLIDES`를 편집한다. 이 배열이
> 배경 크로스페이드 · 스크롤스파이 · 섹션 순서를 구동한다.

## 2. 프로젝트 구조

```
src/
  components/
    layout/    Frame, Slides, Container, Header, CentralCrystal
    sections/  Hero, About, Philosophy, Vision, Portfolio, Manifesto, Contact
    ui/        공용 UI (PlaceholderSection, RevealText)
  hooks/       useSlideController, useFrameSize
  lib/         cn.ts, motion.ts
  config/      slides.ts (슬라이드 순서, 테마, 내비, 엔진 타이밍)
  styles/      keyframes.css (디자인 토큰은 index.css @theme에 위치)
  index.css    Tailwind import + @theme 토큰 + base
public/
  crystal.glb  중앙 크리스탈 3D 소스
```

- **경로 별칭:** `@/` → `src/`
- **스크롤 엔진:** `useSlideController`가 `slide` motion value를 소유하고 제스처를
  스냅 단위로 변환한다.
- **레이아웃:** 디자인 프레임은 `max-width: 1440px` 가운데 정렬. 배경은 풀블리드,
  콘텐츠만 `<Container>`로 프레임 안에 둔다.

## 3. 빠른 시작

> **패키지 매니저는 yarn을 사용한다. npm 사용 금지.**

```bash
# 의존성 설치
yarn

# 개발 서버 실행
yarn dev

# 프로덕션 빌드 (타입체크 + 빌드)
yarn build

# 빌드 결과 미리보기
yarn preview

# 코드 포맷 (Prettier)
yarn format
```

## 4. 기술 스택

| 분류            | 사용 기술                                                  |
| --------------- | ---------------------------------------------------------- |
| 빌드 도구       | Vite 6                                                     |
| 프레임워크      | React 19 + TypeScript 5.7                                  |
| 스타일          | Tailwind CSS v4 (`@tailwindcss/vite`, CSS 우선 `@theme`)   |
| 애니메이션      | motion (framer-motion 후속, `'motion/react'`)              |
| 3D              | three.js + @react-three/fiber + @react-three/drei          |
| 아이콘          | lucide-react                                               |
| 클래스 유틸     | clsx + tailwind-merge (`src/lib/cn.ts`의 `cn()`)           |
| 포매터          | Prettier + prettier-plugin-tailwindcss                     |
| 패키지 매니저   | yarn                                                       |

- **Tailwind 설정은 CSS 우선:** `src/index.css`의 `@import "tailwindcss"` +
  `@theme { … }`. `tailwind.config.js` 없음.
- **디자인 토큰만 사용:** 색 · 간격 · 폰트는 `@theme` 토큰에서 온다. 컴포넌트에
  hex/px 하드코딩 금지.
- **폰트:** Latin은 Montserrat, 한글은 Pretendard.

## 5. 개발 환경

- **Node.js + yarn** (yarn.lock 기준)
- **스크립트**
  - `yarn dev` — 개발 서버
  - `yarn build` — 타입체크(`tsc -b`) + 프로덕션 빌드. **작업 완료 전 실행 권장.**
  - `yarn preview` — 빌드 결과 미리보기
  - `yarn format` — Prettier 포맷
- **컨벤션**
  - 커밋 메시지는 한글 + Conventional Commit 접두사 (`feat:`, `fix:`,
    `refactor:`, `chore:`, `docs:`, `style:`).
  - 코드 주석은 한글로 작성 (식별자 · 타입 · 문자열 리터럴은 원래 언어 유지).
  - 정규형 Tailwind 유틸리티 우선, arbitrary 값(`[..]`) 지양.

> 더 자세한 컨벤션 · 레이아웃 규칙 · 디자인 토큰 · 스크롤 엔진 동작은
> [`CLAUDE.md`](CLAUDE.md)를 참고한다.
