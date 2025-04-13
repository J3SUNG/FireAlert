/**
 * 산불 목록 슬라이스 공개 API
 * 
 * 산불 데이터를 목록 형태로 표시하는 컴포넌트와 관련 기능을 제공합니다.
 * 외부에서 필요한 컴포넌트와 타입만 선택적으로 내보냅니다.
 */

// UI 컴포넌트
import { ForestFireList } from './ui/ForestFireList';
import { ForestFireItem } from './ui/ForestFireItem';

// 필요한 타입만 선택
import type { 
  ForestFireListProps,
  ForestFireItemProps 
} from './model/types';

// UI 컴포넌트 내보내기
export {
  ForestFireList,
  ForestFireItem
};

// 필요한 타입만 내보내기
export type {
  ForestFireListProps,
  ForestFireItemProps
};
