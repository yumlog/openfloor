# OPENFLOOR — 프로젝트 가이드

회사 사이트. 단일 motion value로 구동되는 싱글 페이지·풀스크린 스크롤 스냅
경험. 이 파일은 컨벤션을 문서화한다; 섹션을 채울 때 이를 따른다.

## 상태

엔진 + 스켈레톤은 완료되었고, 모든 섹션에 실제 콘텐츠/인터랙션이 들어가 있다
(초기 `PlaceholderSection` 스캐폴드는 제거됨). 섹션은 한 번에 하나씩 다듬는다.
**요청받지 않으면 섹션 콘텐츠를 만들지 말 것.**

## 스택

- **패키지 매니저: yarn** (`yarn add`, `yarn.lock`). npm 사용 금지.
- **Vite + React + TypeScript**
- **Tailwind CSS v4** — `@tailwindcss/vite` 사용. 설정은 CSS 우선:
  `src/index.css`의 `@import "tailwindcss"` + `@theme { … }`. **`tailwind.config.js`
  없음.**
- **motion** (framer-motion 후속) — `'motion/react'`에서 import.
- 아이콘은 **lucide-react**.
- **clsx + tailwind-merge** → `src/lib/cn.ts`의 `cn()` 헬퍼.
- **Prettier + prettier-plugin-tailwindcss** (`.prettierrc`). `yarn format` 실행.

스크립트: `yarn dev`, `yarn build` (tsc -b + vite build), `yarn preview`,
`yarn format`.

## 명령어

- `yarn dev` — 개발 서버
- `yarn build` — 타입체크 + 프로덕션 빌드 (작업 완료로 보기 전에 실행)
- `yarn format` — Prettier

## 언어 (한글)

- **커밋 메시지는 한글로 작성**하고, Conventional-Commit 접두사를 붙인다:
  `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:` … 예:
  `feat: Manifesto 섹션 추가`.
- **코드 주석은 한글로 작성한다.** (식별자·타입·문자열 리터럴은 원래 언어를
  유지 — 주석과 커밋 본문만 한글.)
- 이 파일(CLAUDE.md)도 한글로 작성한다.

## 레이아웃 규칙

- **디자인 프레임**은 `max-width: 1440px`, 가운데 정렬. 더 넓은 뷰포트는 좌우
  동일 마진을 갖고, 그 마진은 **현재 슬라이드의 배경색으로 번진다(bleed).**
- **풀블리드 요소**(섹션 배경, bg 크로스페이드)는 1440으로 제한하면 **안 된다.**
  *콘텐츠*만 프레임 안에 둔다. 콘텐츠에는 `<Container>`를 쓰고, 배경은 그 바깥에
  둔다.
- **각 섹션은 정확히 한 화면 높이.** `100dvh` / `svh`(모바일 주소창 안전)를 쓰고,
  절대 `vh`를 쓰지 않는다. 단 클래스는 정규형 `h-dvh`(= `h-[100dvh]`)를 쓴다.
- **토큰만 사용.** 색·간격·폰트는 `@theme` 토큰 / Tailwind 유틸리티에서 온다 —
  컴포넌트에 hex/px 하드코딩 금지. (JS 엔진이 필요로 하는 raw 색/너비 상수는
  `src/config/slides.ts`에 미러링되어 있으니 토큰과 동기화할 것.)
- **정규형 유틸리티 우선(arbitrary 값 지양).** 스케일에 정확히 대응하는 값은
  `[..]` 임의값 대신 정규 클래스를 쓴다 — `h-[100dvh]`→`h-dvh`,
  `mt-[16px]`→`mt-4`, `gap-[42px]`→`gap-10.5`, `pt-[88px]`→`pt-22`,
  `size-[56px]`→`size-14`, `z-[40]`→`z-40`, `rounded-[12px]`→`rounded-xl`,
  `leading-[1.5]`→`leading-normal`, `leading-[1]`→`leading-none`,
  `bg-…/[0.08]`→`bg-…/8`, `decoration-[2px]`→`decoration-2`. (px→스케일은 ÷4:
  `[24px]`→`6`, `[42px]`→`10.5`, `[65px]`→`16.25` 식으로 소수도 가능.) 이렇게
  하면 Tailwind IntelliSense의 "can be written as …"(suggestCanonicalClasses)
  경고가 사라진다. **예외:** `clamp()`·커스텀 `em`(`tracking-[-0.04em]`)·임의
  `font-size`(`text-[44px]`)·정규형이 없는 line-height(`leading-[1.4]`)·
  화면밖 측정 오프셋(`left: -99999`는 인라인 style) 등 정규형이 없는 값은 그대로
  둔다.
- **긴 Tailwind 클래스 묶음은 컴포넌트로 추출.**
- **Keyframe 애니메이션**(블록 reveal 등)은 Tailwind 유틸리티 체인에 욱여넣지 말고
  `src/styles/keyframes.css`에 둔다.

## 반응형

전략은 **유동 스케일 (A)**: 1440 디자인은 ≥1440px에서 고정이고, 그 아래에선
프레임 너비에 _비례해_ floor까지 축소된다. 모바일(`<768px`)은 스케일된 데스크탑이
아니라 별도의 전용 reflow다.

- **디자인 기준 너비는 1440px.** ≥1440에선 디자인 값을 그대로 쓰고, 그 아래에선
  스케일한다.
- **고정 px → 유동:** 1440-디자인 값 `N`px은 `clamp(FLOOR, (N/14.4)vw, Npx)`이
  된다. `vw` 항이 `N/14.4`인 이유는 `N`이 프레임의 `N/1440`이고 기준 너비에서
  `1vw = 1440/100`이기 때문. 예: `60px → clamp(36px, 4.17vw, 60px)`,
  `16px → clamp(12px, 1.11vw, 16px)`, `115px → clamp(46px, 8vw, 115px)`.
- **FLOOR**는 디자인 값의 ~55–60%(장식 요소는 더 낮아도 됨). 폰트뿐 아니라
  **모든** 고정 px에 적용: 타입·간격·max-width·아이콘·고스트 텍스트·뱃지.
- **모바일(`<768px`)**은 스케일 대신 `max-md:` override로 자체 레이아웃을 쓴다
  (데스크탑 clamp는 넘치거나 너무 크게 읽힘). 작은 화면에 맞게 명시적으로 reflow·
  재배치·재크기 조정한다.
- **모든 섹션은 모든 너비에서 한 화면(`100dvh`)에 맞아야 한다** — 모바일에서도
  스크롤 엔진이 제스처당 한 섹션씩 스냅한다.
- **중앙 크리스탈**(`App.tsx`)은 `frame.w / 1440`(`useFrameSize` 경유)로 스케일되어
  hero→about 합성이 모든 너비에서 같은 비율을 유지한다; 모바일에선 쌓인 텍스트를
  피해 위치도 옮기고 저사양 렌더로 떨어진다.

## 디자인 토큰 (`src/index.css`의 `@theme`)

| 토큰                     | 값                      | 유틸리티 예시         |
| ------------------------ | ----------------------- | --------------------- |
| `--color-bg-dark`        | `#171717`               | `bg-bg-dark`          |
| `--color-bg-light`       | `#ffffff`               | `bg-bg-light`         |
| `--color-accent`         | `#FB3640`               | `text-accent`         |
| `--color-title-on-dark`  | `#ffffff`               | `text-title-on-dark`  |
| `--color-text-on-dark`   | `#a3a3a3`               | `text-text-on-dark`   |
| `--color-text-nav`       | `#d4d4d4`               | `text-text-nav`       |
| `--color-ghost-on-dark`  | `#262626`               | `text-ghost-on-dark`  |
| `--color-line`           | `#525252`               | `stroke`/`bg-line`    |
| `--color-muted`          | `#737373`               | `text-muted`          |
| `--color-card-deep`      | `#404040`               | `bg-card-deep`        |
| `--font-sans`            | Montserrat → Pretendard | `font-sans`           |
| `--container-frame`      | `1440px`                | `max-w-frame`         |

- **색은 항상 토큰으로.** 컴포넌트·데이터 파일에 hex/`rgb()`/Tailwind 표준 팔레트
  색(`text-white`, `text-neutral-400` 등)을 하드코딩하지 말고 `@theme` 토큰에서 온
  유틸리티(`text-title-on-dark`, `bg-accent` …)를 쓴다. 새 색이 필요하면 먼저
  `index.css`의 `@theme`에 토큰을 추가한 뒤 그 유틸리티를 쓴다. 불투명도가 필요하면
  `bg-title-on-dark/[0.08]`처럼 토큰에 opacity 수식어를 붙인다.
- **JS에서 색이 필요할 때:** DOM 인라인 스타일(`style={{ color: 'var(--color-…)' }}`)·
  SVG `stroke`/`fill`은 `var(--color-…)`로 토큰을 참조한다.
- **예외(토큰화 대상 아님):** three.js 머티리얼/라이트 색(`CentralCrystal`, 셰이더라
  CSS 변수 불가), `keyframes.css`의 RevealText 색수차/마스크, `slides.ts`의 raw 미러
  상수(`BG_DARK`/`BG_LIGHT` — 엔진용이며 토큰과 동기화 유지).
- **폰트:** Latin은 Montserrat(Google Fonts), 한글은 Pretendard(jsDelivr CDN).
  둘 다 `index.html`에 링크. 기본 스택은 Montserrat → Pretendard.
- `::selection`은 accent 색을 쓴다.

## 스크롤 엔진

단일 진실 공급원은 하나의 `slide` motion value(`0, 1, 2 …`); 모든 애니메이션은
`useTransform`으로 여기서 파생된다.

- **`useSlideController`**(`src/hooks/useSlideController.ts`)가 이를 소유한다.
  휠 / 터치 / 키보드를 가로채 **한 제스처 = 한 섹션**으로 스냅하고(쿨다운을 둬
  빠른 스크롤이 건너뛰지 않게), 데스크탑·모바일 모두 스냅을 유지하며, body 스크롤을
  잠근다. `{ slide, index, goTo }`를 반환한다. `index`는 스크롤스파이용 반올림
  슬라이드, `goTo`는 헤더 내비가 쓴다.
- **트랙:** 세로 스택, `transform: translateY(-slide * 100dvh)`(`Slides`).
- **배경 크로스페이드:** `slide` → 라이트/다크를 `useTransform`으로. 라이트/다크
  시퀀스는 설정 기반(`SLIDES`에서 파생한 `BG_STOPS` / `BG_COLORS`)이라, 섹션을
  추가하면 자동으로 확장된다.

### 섹션 추가 / 순서 변경

`src/config/slides.ts`의 `SLIDES`를 편집한다(id, label, `theme: 'dark' | 'light'`).
이 배열이 배경 크로스페이드·스크롤스파이·섹션 순서를 구동한다. 새 섹션이 헤더에
속하면 `NAV_ITEMS`도 갱신한다. 그다음 `src/App.tsx`의 트랙에 섹션 컴포넌트를
추가한다.

## 중앙 크리스탈 (hero → about)

- three.js로 렌더하는 부유 크리스탈(`src/components/layout/CentralCrystal.tsx`).
  GLB 소스 `public/crystal.glb`(URL `/crystal.glb`), R3F `<Canvas>`(알파)로 그린다.
  비디오/블렌드 모드 없음 — 캔버스가 HeroGhost 위에 일반 스택 순서로 겹친다.
- 질감: drei `MeshTransmissionMaterial`(유리 투과) + 프레넬 림 셸 + `Environment`
  안의 `Lightformer` 라이트 + `EffectComposer`의 Bloom/DOF. 호버·파편 없이 자동
  부유 + 회전만(`useFrame`).
- 멀티 메시 대응: scene을 순회해 모든 mesh geometry를 모으고, 합 바운딩박스로
  원점 정렬·정규화 스케일을 잡는다. 반응형으로 `clamp(size.width/1440, 0.6, 1.1)`.
- 저사양(모바일 `<768px`): `samples`/`resolution`을 낮추고 Bloom을 줄이며 DOF를 끈다.
- 성능: `slide < 1.9`(hero/about 구간)일 때만 `frameloop='always'`, 그 밖에선
  `'never'`로 렌더를 멈춘다(`App.tsx`의 `crystalVisible` 구독).
- 스크롤 안무: 예전 비디오와 동일한 박스(`scale/x/y/opacity`)를 받는다. 슬라이드
  0 → 1에서 축소되며 우상단으로 이동, slide 1.3~1.75에서 페이드 아웃한다
  (`App.tsx`의 `useTransform` 매핑).

## 헤더 / 내비

- 로고 `OPENFLOOR` + 링크: **About Us, Philosophy, Vision, Portfolio** (Team·Work
  없음).
- 링크 클릭 시 해당 슬라이드로 스냅(`goTo`); 활성 슬라이드의 링크는 accent 색으로
  표시된다(`index` 기반 스크롤스파이). 텍스트 색은 현재 슬라이드 테마에 맞춰
  바뀐다.

## 섹션 (순서)

7개 슬라이드: **Hero, About, Philosophy, Portfolio, Vision, Manifesto, Contact**
(순서는 `SLIDES` 기준). 모두 실제 콘텐츠/인터랙션이 구현되어 있다. (Manifesto는
내비에 없는 스크롤 트랩 3D 드럼 섹션이다.)

## 폴더 구조

```
src/
  components/
    layout/    Frame, Slides, Container, Header, CentralCrystal
    sections/  Hero, About, Philosophy, Vision, Portfolio, Manifesto, Contact
    ui/        공용 UI (RevealText)
  hooks/       useSlideController, useFrameSize
  lib/         cn.ts, motion.ts
  config/      slides.ts (슬라이드 순서, 테마, 내비, 엔진 타이밍)
  styles/      keyframes.css (토큰은 index.css @theme에 있음)
  index.css    Tailwind import + @theme 토큰 + base
```

경로 별칭: `@/` → `src/`.
