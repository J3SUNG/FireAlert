/**
 * 범용 캐시 관리자 클래스
 * 데이터 캐싱을 위한 유틸리티 클래스입니다.
 * 
 * @template T 캐시할 데이터 유형
 */
export class CacheManager<T> {
  private cachedData: T | null = null;
  private cacheTimestamp: number | null = null;
  private readonly cacheDuration: number;

  /**
   * 캐시 관리자 생성자
   * @param cacheDuration 캐시 유효 기간 (밀리초)
   */
  constructor(cacheDuration: number) {
    this.cacheDuration = cacheDuration;
  }

  /**
   * 현재 캐시된 데이터가 유효한지 확인
   * @returns 캐시가 유효하면 true, 그렇지 않으면 false
   */
  isValid(): boolean {
    if (!this.cachedData || !this.cacheTimestamp) return false;
    const now = Date.now();
    return now - this.cacheTimestamp < this.cacheDuration;
  }

  /**
   * 데이터를 캐시에 저장
   * @param data 캐시할 데이터
   */
  setData(data: T): void {
    this.cachedData = data;
    this.cacheTimestamp = Date.now();
  }

  /**
   * 캐시된 데이터 가져오기
   * @returns 캐시된 데이터 또는 null
   */
  getData(): T | null {
    return this.isValid() ? this.cachedData : null;
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cachedData = null;
    this.cacheTimestamp = null;
  }
}
