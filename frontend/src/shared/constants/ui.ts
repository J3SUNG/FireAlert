/**
 * UI 관련 상수
 */
export const FIRE_STATUS_TEXT = {
  all: "전체",
  active: "진화중",
  contained: "통제중",
  extinguished: "진화완료",
};

export const LOADING_MESSAGE = "산불 데이터를 불러오는 중...";

export const ERROR_MESSAGES = {
  default: "에러가 발생했습니다. 다시 시도해주세요.",
  network: "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해 주세요.",
  server: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
  data: "데이터를 불러오는 중 문제가 발생했습니다.",
};

export const BUTTON_TEXT = {
  retry: "다시 시도",
};

export const APP_TITLE = {
  main: "불씨알림",
  subtitle: "전국 산불 모니터링 시스템",
};

export const FIRE_STATUS_CLASSES = {
  all: "fire-button--active-all",
  active: "fire-button--active-red",
  contained: "fire-button--active-orange",
  extinguished: "fire-button--active-green",
};

export const DEFAULT_BUTTON_CLASS = "fire-button";
