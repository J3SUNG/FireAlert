import React, { useState, useEffect } from "react";
import { ForestFireList } from "../features/forest-fire-list/ui/ForestFireList";
import { ForestFireData } from "../shared/types/forestFire";
import { ModifiedForestFireMap } from "../features/forest-fire-map";
import { forestFireService } from "../shared/services/forestFireService";
import "./styles/fire-alert.css";

const FireAlertPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "contained" | "extinguished">("all");
  const [selectedFireId, setSelectedFireId] = useState<string | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [fires, setFires] = useState<ForestFireData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await forestFireService.getForestFires();
        setFires(data);
        setError(null);
      } catch (err) {
        console.error("산불 데이터를 가져오는 중 오류 발생:", err);
        setError("산불 데이터를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    const fetchData = (): null => {
      loadData().catch((error: unknown) => {
        console.error("산불 데이터 로드 중 오류:", error);
      });
      return null;
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const filteredData = fires.filter((fire) => {
    if (selectedFilter === "all") return true;
    return fire.status === selectedFilter;
  });

  const getButtonClass = (filter: "all" | "active" | "contained" | "extinguished"): string => {
    const className = "fire-alert__button";

    if (filter === selectedFilter) {
      if (filter === "all") return `${className} fire-alert__button--active`;
      if (filter === "active") return `${className} fire-alert__button--active-red`;
      if (filter === "contained") return `${className} fire-alert__button--active-orange`;
      return `${className} fire-alert__button--active-green`;
    }

    return className;
  };

  const statusCounts = {
    total: fires.length,
    active: fires.filter((fire) => fire.status === "active").length,
    contained: fires.filter((fire) => fire.status === "contained").length,
    extinguished: fires.filter((fire) => fire.status === "extinguished").length,
  };

  const responseLevelCounts = {
    level3: fires.filter((f) => f.severity === "critical").length,
    level2: fires.filter((f) => f.severity === "high").length,
    level1: fires.filter((f) => f.severity === "medium" || f.severity === "low").length,
  };

  const getFilterButtonLabels = () => {
    return {
      all: `전체 (${statusCounts.total.toString()})`,
      active: `진화중 (${statusCounts.active.toString()})`,
      contained: `통제중 (${statusCounts.contained.toString()})`,
      extinguished: `진화완료 (${statusCounts.extinguished.toString()})`,
    };
  };

  const handleFireSelect = (fire: ForestFireData): null => {
    setSelectedFireId((prevId) => (prevId === fire.id ? undefined : fire.id));
    return null;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReload = (): null => {
    window.location.reload();
    return null;
  };

  return (
    <div className="fire-alert">
      <header className="fire-alert__header">
        <div className="fire-alert__logo-container">
          <div className="fire-alert__logo-icon">🔥</div>
          <h1 className="fire-alert__logo-text">
            <span className="fire-alert__logo-text--fire">Fire</span>Alert
          </h1>
          <span className="fire-alert__subtitle">전국 산불 모니터링 시스템</span>
        </div>

        <div className="fire-alert__filter-container">
          <button
            className={getButtonClass("all")}
            onClick={(): void => {
              setSelectedFilter("all");
            }}
          >
            {getFilterButtonLabels().all}
          </button>
          <button
            className={getButtonClass("active")}
            onClick={(): void => {
              setSelectedFilter("active");
            }}
          >
            {getFilterButtonLabels().active}
          </button>
          <button
            className={getButtonClass("contained")}
            onClick={(): void => {
              setSelectedFilter("contained");
            }}
          >
            {getFilterButtonLabels().contained}
          </button>
          <button
            className={getButtonClass("extinguished")}
            onClick={(): void => {
              setSelectedFilter("extinguished");
            }}
          >
            {getFilterButtonLabels().extinguished}
          </button>
        </div>

        <div className="fire-alert__timestamp">최종 업데이트: {formatDate(currentTime)}</div>
      </header>

      <div className="fire-alert__content">
        {loading ? (
          <div className="fire-alert__loading-container">
            <div className="fire-alert__spinner"></div>
            <p className="fire-alert__loading-text">산불 데이터를 불러오는 중...</p>
          </div>
        ) : error !== null && error !== "" ? (
          <div className="fire-alert__error-container">
            <p className="fire-alert__error-text">{error}</p>
            <button
              className="fire-alert__retry-button"
              onClick={() => {
                const result = handleReload();
                return result;
              }}
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <div className="fire-alert__map-container">
              <ModifiedForestFireMap
                fires={filteredData}
                selectedFireId={selectedFireId}
                onFireSelect={handleFireSelect}
                legendPosition="bottomleft"
              />

              <div className="fire-alert__status-summary">
                <h3 className="fire-alert__summary-title">산불 대응단계 현황</h3>
                <div className="fire-alert__summary-grid">
                  <div className="fire-alert__summary-item">
                    <span className="fire-alert__summary-label">총 발생</span>
                    <span className="fire-alert__summary-value fire-alert__summary-value--total">
                      {statusCounts.total.toString()}
                    </span>
                  </div>
                  <div className="fire-alert__summary-item">
                    <span className="fire-alert__summary-label">대응단계 3단계</span>
                    <span className="fire-alert__summary-value fire-alert__summary-value--active">
                      {responseLevelCounts.level3.toString()}
                    </span>
                  </div>
                  <div className="fire-alert__summary-item">
                    <span className="fire-alert__summary-label">대응단계 2단계</span>
                    <span className="fire-alert__summary-value fire-alert__summary-value--contained">
                      {responseLevelCounts.level2.toString()}
                    </span>
                  </div>
                  <div className="fire-alert__summary-item">
                    <span className="fire-alert__summary-label">대응단계 1단계</span>
                    <span className="fire-alert__summary-value fire-alert__summary-value--extinguished">
                      {responseLevelCounts.level1.toString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="fire-alert__sidebar">
              <div className="fire-alert__sidebar-header">
                <h2 className="fire-alert__sidebar-title">산불 데이터 현황</h2>
                <p className="fire-alert__sidebar-subtitle">
                  {selectedFilter === "all"
                    ? `현재 ${String(filteredData.length)}건의 산불 정보가 표시되고 있습니다.`
                    : `현재 ${
                        selectedFilter === "active"
                          ? "진화중인"
                          : selectedFilter === "contained"
                          ? "통제중인"
                          : "진화완료된"
                      } 산불 ${String(filteredData.length)}건이 표시되고 있습니다.`}
                </p>
              </div>

              <div className="fire-alert__sidebar-content">
                <ForestFireList
                  fires={filteredData}
                  showFilter={false}
                  selectedFireId={selectedFireId}
                  onFireSelect={handleFireSelect}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FireAlertPage;