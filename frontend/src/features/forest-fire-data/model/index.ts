/**
 * 산불 데이터 모델 타입 내보내기
 */
export * from './types';
// dataErrorTypes는 이제 shared/lib/errors에서 가져옴
export {
  createFireDataFetchError,
  createFireDataUpdateError,
  createFireDataParseError,
  createForestFireDataError,
  DataErrorCode
} from '../../../shared/lib/errors';