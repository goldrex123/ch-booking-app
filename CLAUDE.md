# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요
차량 및 부속실 예약 관리 시스템 (Next.js 15 + React 19)

## 개발 명령어

### 개발 서버
```bash
npm run dev  # http://localhost:3000
```

### 빌드 및 프로덕션
```bash
npm run build  # 프로덕션 빌드
npm start      # 빌드된 앱 실행
```

### 린트
```bash
npm run lint
```

## 아키텍처

### 디렉토리 구조
```
src/
├── app/                    # Next.js 15 App Router
│   ├── (dashboard)/       # 인증 필요한 대시보드 레이아웃 그룹
│   │   ├── dashboard/     # 메인 대시보드
│   │   ├── vehicles/      # 차량 관리
│   │   ├── bookings/      # 예약 목록
│   │   └── vehicle-booking/ # 차량 예약
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 로그인 페이지 (/)
├── components/
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── common/           # 공통 컴포넌트 (LoadingSpinner, ErrorMessage, ConfirmDialog)
│   ├── layout/           # 레이아웃 컴포넌트 (Navbar, Sidebar)
│   ├── auth/             # 인증 관련 컴포넌트
│   └── vehicle/          # 차량 관련 컴포넌트
├── lib/
│   ├── api/              # API 레이어 (현재 localStorage 기반)
│   │   ├── client.ts     # StorageClient 및 simulateApiCall
│   │   ├── auth.ts
│   │   ├── bookings.ts
│   │   ├── rooms.ts
│   │   └── vehicles.ts
│   ├── validations/      # Zod 스키마
│   ├── constants.ts      # 상수 정의
│   └── utils.ts          # 유틸리티 함수 (cn 등)
├── store/                # Zustand 상태 관리
│   ├── authStore.ts      # 인증 상태 (persist)
│   ├── bookingStore.ts
│   ├── roomStore.ts
│   └── vehicleStore.ts
└── types/                # TypeScript 타입 정의
    ├── auth.ts
    ├── vehicle.ts
    ├── room.ts
    ├── booking.ts
    └── index.ts          # 타입 통합 export
```

### 라우팅 패턴
- **Route Groups**: `(dashboard)` - 인증 필요한 페이지를 그룹화하여 공통 레이아웃 적용
- **Dynamic Routes**: `vehicles/[id]/edit` - 차량 수정 페이지
- **루트 페이지** (`/`): 로그인 페이지
- **인증 가드**: `(dashboard)/layout.tsx`에서 `useAuthStore`로 인증 상태 확인 후 미인증 시 루트로 리다이렉트

### 상태 관리 패턴 (Zustand)
- **persist 미들웨어**: authStore에 적용하여 localStorage 자동 동기화
- **immer 미들웨어**: 다른 스토어에 적용하여 불변성 관리
- 모든 스토어는 `create<StoreType>()()` 패턴 사용 (TypeScript 타입 안전성)

### API 레이어 구조
- **현재**: `lib/api/client.ts`의 `StorageClient` 클래스로 localStorage 기반 구현
- **simulateApiCall**: 실제 API처럼 비동기(300ms 지연) 동작
- **마이그레이션 준비**: 추후 Spring Boot API로 교체 시 `lib/api/` 파일들만 수정하면 됨
- **ApiResponse<T>** 인터페이스로 일관된 응답 구조 유지

### 폼 처리 패턴
- **React Hook Form** + **Zod** 결합
- Zod 스키마는 `lib/validations/`에 정의
- `@hookform/resolvers/zod`로 스키마 연결
- 폼 컴포넌트에서 `useForm<FormDataType>()` 사용

### TypeScript 설정
- **경로 별칭**: `@/*` → `./src/*`
- **noUncheckedIndexedAccess**: true (배열 인덱스 접근 시 undefined 체크 필수)
- **strict**: true

### 스타일링
- **Tailwind CSS 4** + **shadcn/ui**
- `globals.css`에 CSS 변수로 테마 정의
- `cn()` 유틸리티 함수로 클래스 병합 (`lib/utils.ts`)

## 주요 컨벤션

### 컴포넌트 네이밍
- **PascalCase**: 컴포넌트, 타입
- **camelCase**: 함수, 변수

### 파일 구조
- 기능별로 파일 분리 (auth, vehicle, booking, room)
- UI 컴포넌트는 `components/ui/`에 격리
- 비즈니스 로직은 `lib/api/`와 `store/`에 분리

### 데이터 흐름
1. 사용자 액션 → React Hook Form
2. Zod 스키마로 유효성 검사
3. Store의 액션 호출 → API 레이어 호출
4. API 레이어 → StorageClient (현재) / REST API (추후)
5. 응답 → Store 업데이트 → UI 리렌더링
