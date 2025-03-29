import { ForestFireData } from "../types/forestFire";
import axios from "axios";
export interface ForestFireService {
  getForestFires(): Promise<ForestFireData[]>;
  getFiresByProvince(province: string): Promise<ForestFireData[]>;
  getFiresByStatus(status: ForestFireData["status"]): Promise<ForestFireData[]>;
  getFireById(id: string): Promise<ForestFireData | undefined>;
}

// API 기반 구현
export class ForestFireServiceImpl implements ForestFireService {
  private readonly API_URL = "http://localhost:4000/api/fireList";


  async getForestFires(): Promise<ForestFireData[]> {
    try {
      // 백엔드 API 호출
      const response = await axios.get<Record<string, unknown>[]>(this.API_URL);

      // API 응답 데이터를 ForestFireData 형식으로 변환
      return this.convertToForestFireData(response.data);
    } catch (error) {
      console.error("산불 데이터를 가져오는 중 오류 발생:", error);
      // 오류 발생 시 테스트 데이터 반환
      return this.getTestData();
    }
  }


  async getFiresByProvince(province: string): Promise<ForestFireData[]> {
    try {
      const fires = await this.getForestFires();
      return fires.filter((fire) => fire.province === province);
    } catch (error) {
      console.error(`${province} 지역의 산불 데이터를 가져오는 중 오류 발생:`, error);
      return [];
    }
  }


  async getFiresByStatus(status: ForestFireData["status"]): Promise<ForestFireData[]> {
    try {
      const fires = await this.getForestFires();
      return fires.filter((fire) => fire.status === status);
    } catch (error) {
      console.error(`상태가 ${status}인 산불 데이터를 가져오는 중 오류 발생:`, error);
      return [];
    }
  }


  async getFireById(id: string): Promise<ForestFireData | undefined> {
    try {
      const fires = await this.getForestFires();
      return fires.find((fire) => fire.id === id);
    } catch (error) {
      console.error(`ID가 ${id}인 산불 데이터를 가져오는 중 오류 발생:`, error);
      return undefined;
    }
  }

  // 전송된 백엔드 API 데이터를 ForestFireData 형식으로 변환
  private convertToForestFireData(apiData: Record<string, unknown>[]): ForestFireData[] {
    console.log("변환할 데이터:", apiData);

    return apiData.map((item, index) => {
      // 타입 안전성을 위해 레코드에서 값을 가져옵니다
      const itemObj = item;


      if (index === 0) {
        console.log("첫 번째 산불 데이터 항목:", item);
      }


      const dateStr = typeof itemObj.date === "string" ? itemObj.date : "";
      const formattedDate =
        dateStr.length === 8
          ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
          : dateStr;


      const extinguishPercentage =
        typeof itemObj.percentage === "string" || typeof itemObj.percentage === "number"
          ? String(itemObj.percentage)
          : "0";


      const status = this.convertStatus(
        typeof itemObj.status === "string" ? itemObj.status : "",
        extinguishPercentage
      );


      const responseLevelName = typeof itemObj.issueName === "string" ? itemObj.issueName : "1단계";
      const responseLevel = this.getResponseLevel(responseLevelName);


      const location = typeof itemObj.location === "string" ? itemObj.location : "";
      const sigungu = typeof itemObj.sigungu === "string" ? itemObj.sigungu : undefined;
      const extractedLocation = this.extractLocation(location, sigungu);
      const { province } = extractedLocation;


      const itemIndex =
        typeof itemObj.index === "string" || typeof itemObj.index === "number"
          ? itemObj.index
          : index + 1;
      console.log(
        `ID: ${String(itemIndex)}, 위치: ${location}, 추출된 시군구: ${extractedLocation.district}`
      );


      const coordinates = this.getRandomCoordinatesFor(province, extractedLocation.district, location);

      return {
        id: `ff-${String(itemIndex)}`,
        location: location,
        date: formattedDate,
        severity: responseLevel, // 대응단계를 표시
        status,
        coordinates,
        affectedArea: parseFloat((Math.random() * 50).toFixed(1)), // 임의 영향 면적
        description: this.getDescriptionByStatus(status),
        province,
        district: extractedLocation.district,
        extinguishPercentage, // 진화율 추가
        responseLevelName, // 대응단계 이름 추가
      };
    });
  }

  // 상태 정보 전환 - 진화율 정보 추가
  private convertStatus(status: string, percentage: string): ForestFireData["status"] {
    // 진화율이 100%면 진화 완료
    if (percentage === "100") return "extinguished";

    if (status === "") return "active";

    if (status.includes("진화완료")) return "extinguished";
    if (status.includes("진화중") || status.includes("진행")) return "active";

    // 그 외의 경우 통제중으로 간주
    return "contained";
  }

  // 대응단계를 severity로 변환 - 심각도대신 대응단계로 사용
  private getResponseLevel(issueName: string): ForestFireData["severity"] {
    // 3단계가 가장 심각
    if (issueName.includes("3단계")) return "critical";
    if (issueName.includes("2단계")) return "high";
    if (issueName.includes("1단계")) return "medium";

    // 임의 기본값
    return "low";
  }

  private extractLocation(
    location: string,
    sigungu?: string
  ): { province: string; district: string } {
    if (location === "") return { province: "기타", district: "" };

    const parts = location.split(" ");
    let province = "기타";
    let district = "";

    // 대략적인 시도 이름 추출
    if (parts.length > 0) {
      if (
        parts[0].includes("도") ||
        parts[0].includes("시") ||
        parts[0].includes("특별") ||
        parts[0].includes("광역")
      ) {
        province = parts[0];
      }
    }

    // 백엔드에서 시군구 정보를 제공할 경우 사용
    if (typeof sigungu === "string" && sigungu.length > 0) {
      district = sigungu;
    }
    // 그렇지 않으면 주소에서 시군구 추출 시도
    else if (parts.length > 1) {
      // 두 번째 부분이 시군구이면 추출
      if (parts[1].endsWith("시") || parts[1].endsWith("군") || parts[1].endsWith("구")) {
        district = parts[1];
      }
      // 시군구 추출 실패시, 추가 계산 시도
      else {
        // 재시도: 전체 주소에서 시군구 검색
        for (let i = 1; i < parts.length; i++) {
          if (parts[i].endsWith("시") || parts[i].endsWith("군") || parts[i].endsWith("구")) {
            district = parts[i];
            break;
          }
        }

        // 여전히 못 찾았다면, 개선된 방법 사용
        if (district === "") {
          // 특정 시군구 이름 직접 찾기
          const locationStr = location.toLowerCase();
          const locationsToCheck = [
            "고성군",
            "북구",
            "서구",
            "영천시",
            "동구",
            "남구",
            "중구",
            "양산구",
            "양천군",
            "작천군",
            "서해군",
            "양구군",
            "김해시",
            "경산시",
            "마산시",
          ];

          for (const loc of locationsToCheck) {
            if (locationStr.includes(loc.toLowerCase())) {
              district = loc;
              break;
            }
          }
        }
      }
    }

    return { province, district };
  }

  // 정해진 시도에 대한 대략적인 좌표 및 시군구 편의 기능
  private getRandomCoordinatesFor(province: string, district?: string, location?: string): {
    lat: number;
    lng: number;
  } {
    // 한국 시도별 정확한 중앙 좌표
    const baseCoordinates: Record<string, { lat: number; lng: number }> = {
      강원도: { lat: 37.880, lng: 127.730 },
      경기도: { lat: 37.400, lng: 127.550 },
      경상남도: { lat: 35.460, lng: 128.210 },
      경상북도: { lat: 36.020, lng: 128.940 },
      광주광역시: { lat: 35.160, lng: 126.850 },
      대구광역시: { lat: 35.870, lng: 128.600 },
      대전광역시: { lat: 36.350, lng: 127.380 },
      부산광역시: { lat: 35.180, lng: 129.080 },
      서울특별시: { lat: 37.570, lng: 126.980 },
      세종특별자치시: { lat: 36.480, lng: 127.290 },
      울산광역시: { lat: 35.540, lng: 129.310 },
      인천광역시: { lat: 37.460, lng: 126.700 },
      전라남도: { lat: 34.870, lng: 126.990 },
      전라북도: { lat: 35.720, lng: 127.150 },
      제주특별자치도: { lat: 33.500, lng: 126.530 },
      충청남도: { lat: 36.660, lng: 126.670 },
      충청북도: { lat: 36.800, lng: 127.700 },
      기타: { lat: 36.500, lng: 127.500 },
    };

    // 시군구 레벨의 특정 좌표 추가 - 개선된 정확도
    const districtCoordinates: Record<string, { lat: number; lng: number }> = {
      // 강원도
      원주시: { lat: 37.342, lng: 127.920 },
      충주시: { lat: 37.881, lng: 127.736 },
      고성군: { lat: 38.379, lng: 128.467 },
      // 경기도
      수원시: { lat: 37.263, lng: 127.028 },
      가평군: { lat: 37.831, lng: 127.510 },
      양평군: { lat: 37.489, lng: 127.574 },
      // 경상북도
      안동시: { lat: 36.568, lng: 128.729 },
      영천시: { lat: 35.972, lng: 128.939 },
      포항시: { lat: 36.019, lng: 129.358 },
      // 경상남도
      김해시: { lat: 35.228, lng: 128.889 },
      진해시: { lat: 35.180, lng: 128.980 },
      사천시: { lat: 35.000, lng: 128.063 },
      // 전라북도
      전주시: { lat: 35.824, lng: 127.148 },
      익산시: { lat: 35.948, lng: 126.958 },
      고창군: { lat: 35.435, lng: 127.219 },
      // 전라남도
      목포시: { lat: 34.811, lng: 126.393 },
      여수시: { lat: 34.760, lng: 127.662 },
      해남군: { lat: 34.573, lng: 126.599 },
      // 충청북도
      청주시: { lat: 36.641, lng: 127.489 },
      제천시: { lat: 37.132, lng: 128.191 },
      체뽕군: { lat: 36.825, lng: 127.421 },
      // 충청남도
      철주군: { lat: 36.303, lng: 127.252 },
      서산시: { lat: 36.784, lng: 126.450 },
      아산시: { lat: 36.790, lng: 127.003 },
    };

    // 시군구가 특정되었을 경우 시군구 좌표 사용
    if (location) {
      const locationLower = location.toLowerCase();
      for (const [districtName, coords] of Object.entries(districtCoordinates)) {
        if (locationLower.includes(districtName.toLowerCase())) {
          // 시군구에 맞는 좌표를 찾았으면 작은 편차 적용
          return {
            lat: coords.lat + (Math.random() - 0.5) * 0.05, // 편차를 1/10로 줄임
            lng: coords.lng + (Math.random() - 0.5) * 0.05,
          };
        }
      }
    }
    
    // 특정 시군구 좌표가 있는지 확인 
    if (district) {
      const districtLower = district.toLowerCase();
      for (const [districtName, coords] of Object.entries(districtCoordinates)) {
        if (districtLower === districtName.toLowerCase()) {
          return {
            lat: coords.lat + (Math.random() - 0.5) * 0.05,
            lng: coords.lng + (Math.random() - 0.5) * 0.05,
          };
        }
      }
    }

    // 시도에 따른 좌표 가져오기
    const base = baseCoordinates[province] ?? baseCoordinates["\uae30\ud0c0"];

    // 시도 레벨이면 더 작은 임의성 적용 (러운하게 모이게)
    return {
      lat: base.lat + (Math.random() - 0.5) * 0.2, // 물씬우기, 퍼짐 범위를 줄였지만 시간성은 유지
      lng: base.lng + (Math.random() - 0.5) * 0.2,
    };
  }

  // 상태에 따른 임의 설명 생성
  private getDescriptionByStatus(status: ForestFireData["status"]): string | undefined {
    if (Math.random() < 0.5) return undefined; // 50% 확률로 설명 없음

    const descriptions: Record<ForestFireData["status"], string[]> = {
      active: [
        "강풍으로 인한 빠른 확산, 산림청 헬기 투입",
        "등산객의 취사 과정에서 발생한 것으로 추정",
        "야간에 발생한 산불로 진화에 어려움",
        "산림 밀집 지역으로 확산 속도가 빠름",
        "건조한 날씨로 인해 발생, 진화 중",
      ],
      contained: [
        "해당 지역 통제 중, 추가 확산 없음",
        "인력과 장비 추가 투입으로 통제 중",
        "해당 지역 분무수가 분사되어 통제 중",
        "주변 마을 대피 완료, 현재 통제 중",
        "산불 진화선 구축으로 통제 중",
      ],
      extinguished: [
        "완전히 진화 완료, 재발화 방지 조치 중",
        "진화 완료, 피해 조사 진행 중",
        "비로 인한 도움으로 진화 완료",
        "중앙 및 지자체 협력으로 지고",
        "산불 진화 완료, 현장 정리 중",
      ],
    };

    const list = Object.prototype.hasOwnProperty.call(descriptions, status) ? descriptions[status] : descriptions.active;
    return list[Math.floor(Math.random() * list.length)];
  }

  // 테스트용 데이터
  private getTestData(): ForestFireData[] {
    // 현재 날짜를 기준으로 최근 날짜로 설정
    const currentDate = new Date();
    const formatDate = (date: Date): string => {
      return date.toISOString().split("T")[0];
    };

    // 3일 전
    const threeDaysAgo = new Date(currentDate);
    threeDaysAgo.setDate(currentDate.getDate() - 3);

    // 2일 전
    const twoDaysAgo = new Date(currentDate);
    twoDaysAgo.setDate(currentDate.getDate() - 2);

    // 1일 전
    const oneDayAgo = new Date(currentDate);
    oneDayAgo.setDate(currentDate.getDate() - 1);

    // 오늘
    const today = currentDate;

    return [
      {
        id: "ff-001",
        location: "강원도 춘천시 남산면",
        date: formatDate(threeDaysAgo),
        severity: "high",
        status: "contained",
        coordinates: {
          lat: 37.8813,
          lng: 127.73,
        },
        affectedArea: 23.5,
        description: "건조한 날씨로 인해 발생, 주변 마을 대피 완료",
        province: "강원도",
        district: "춘천시",
        extinguishPercentage: "65",
        responseLevelName: "2단계",
      },
      {
        id: "ff-002",
        location: "경상북도 안동시 도산면",
        date: formatDate(twoDaysAgo),
        severity: "medium",
        status: "active",
        coordinates: {
          lat: 36.576,
          lng: 128.7402,
        },
        affectedArea: 15.2,
        province: "경상북도",
        district: "안동시",
        extinguishPercentage: "35",
        responseLevelName: "1단계",
      },
      {
        id: "ff-003",
        location: "전라남도 해남군 삼산면",
        date: formatDate(oneDayAgo),
        severity: "low",
        status: "extinguished",
        coordinates: {
          lat: 34.5415,
          lng: 126.5958,
        },
        affectedArea: 5.7,
        province: "전라남도",
        district: "해남군",
        extinguishPercentage: "100",
        responseLevelName: "1단계",
      },
      {
        id: "ff-004",
        location: "경기도 가평군 상면",
        date: formatDate(today),
        severity: "critical",
        status: "active",
        coordinates: {
          lat: 37.8318,
          lng: 127.5128,
        },
        affectedArea: 42.1,
        description: "강풍으로 인한 빠른 확산, 산림청 헬기 5대 투입",
        province: "경기도",
        district: "가평군",
        extinguishPercentage: "25",
        responseLevelName: "3단계",
      },
      {
        id: "ff-005",
        location: "충청북도 제천시 백운면",
        date: formatDate(twoDaysAgo),
        severity: "high",
        status: "contained",
        coordinates: {
          lat: 37.0965,
          lng: 128.1707,
        },
        affectedArea: 31.8,
        province: "충청북도",
        district: "제천시",
        extinguishPercentage: "78",
        responseLevelName: "2단계",
      },
    ] as ForestFireData[];
  }
}

// 싱글톤 인스턴스
export const forestFireService = new ForestFireServiceImpl();


export const getForestFireStatistics = (fires: ForestFireData[]) => {
  const provinceStats = {} as Record<
    string,
    { count: number; active: number; contained: number; extinguished: number; totalArea: number }
  >;


  fires.forEach((fire) => {
    const province = fire.province ?? "기타";
    if (!(province in provinceStats)) {
      provinceStats[province] = {
        count: 0,
        active: 0,
        contained: 0,
        extinguished: 0,
        totalArea: 0,
      };
    }

    const stats = provinceStats[province];
    stats.count += 1;
    stats.totalArea += fire.affectedArea;

    if (fire.status === "active") stats.active += 1;
    else if (fire.status === "contained") stats.contained += 1;
    else stats.extinguished += 1;
  });


  const severityStats = {
    critical: fires.filter((f) => f.severity === "critical").length,
    high: fires.filter((f) => f.severity === "high").length,
    medium: fires.filter((f) => f.severity === "medium").length,
    low: fires.filter((f) => f.severity === "low").length,
  };


  const statusStats = {
    total: fires.length,
    active: fires.filter((f) => f.status === "active").length,
    contained: fires.filter((f) => f.status === "contained").length,
    extinguished: fires.filter((f) => f.status === "extinguished").length,
  };


  const totalArea = fires.reduce((sum, fire) => sum + fire.affectedArea, 0);

  return {
    provinceStats,
    severityStats,
    statusStats,
    totalArea,
  };
};
