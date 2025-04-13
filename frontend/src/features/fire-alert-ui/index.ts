/**
 * 산불 알림 UI 슬라이스 공개 API
 * 
 * 산불 알림 페이지 레이아웃 및 UI 컴포넌트를 제공합니다.
 * 외부에서 필요한 컴포넌트와 타입만 선택적으로 내보냅니다.
 */

// UI 컴포넌트
import { 
  FireAlertHeader,
  FireAlertContent,
  FireAlertSidebar,
  FireAlertButtons,
  StatusSummary
} from './ui';

// 필요한 타입만 선택
import type {
  FireAlertHeaderProps,
  FireAlertContentProps,
  FireAlertSidebarProps,
  StatusSummaryProps
} from './model/types';

// UI 컴포넌트 내보내기
export {
  FireAlertHeader,
  FireAlertContent,
  FireAlertSidebar,
  FireAlertButtons,
  StatusSummary
};

// 필요한 타입만 내보내기
export type {
  FireAlertHeaderProps,
  FireAlertContentProps,
  FireAlertSidebarProps,
  StatusSummaryProps
};
