/**
 * 공통 UI 세그먼트 공개 API
 *
 * 여러 기능에서 공통으로 사용하는 UI 컴포넌트와 스타일을 제공합니다.
 * 필요한 컴포넌트와 유틸리티만 선택적으로 내보냅니다.
 */

// 공통 UI 컴포넌트
import { FireStatusSummary } from "./FireStatusSummary";
import { 
  Button, 
  LoadingIndicator, 
  ErrorDisplay 
} from "./components";

// UI 유틸리티
import { combineClasses } from "./utils/classNameUtils";

// CSS 스타일 가져오기 (내보내기 아닌 단순 import)
import "./styles/common-components.css";

// 공통 UI 컴포넌트 내보내기
export {
  Button,
  LoadingIndicator,
  ErrorDisplay,
  FireStatusSummary
};

// UI 유틸리티 내보내기
export {
  combineClasses
};
