import React from "react";
import { ForestFireList } from "../../features/forest-fire-list/ui/ForestFireList";
import { ForestFireMap } from "../../features/forest-fire-map";
import { FireStatusSummary } from "../../shared";
import { useFireAlertData } from "../../features/fire-alert-data/api/useFireAlertData";
import { useCurrentTime, useFireFilterAndSelection } from "../../shared";
import "./fire-alert.css";

const FireAlertPage: React.FC = () => {
  // 데이터 로딩 로직을 훅으로 분리
  const { fires, loading, error, statusCounts, responseLevelCounts, handleReload } =
    useFireAlertData();

  // 필터링 및 선택 상태 관리 훅
  const {
    selectedFilter,
    setSelectedFilter,
    selectedFireId,
    filteredData,
    handleFireSelect,
    getButtonClass,
    getFilterButtonLabels,
  } = useFireFilterAndSelection(fires);

  // 현재 시간 상태 관리 훅
  const { currentTime, formatDate } = useCurrentTime();

  // 필터 버튼 라벨 데이터
  const buttonLabels = getFilterButtonLabels(statusCounts);

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
            onClick={() => setSelectedFilter("all")}
          >
            {buttonLabels.all}
          </button>
          <button
            className={getButtonClass("active")}
            onClick={() => setSelectedFilter("active")}
          >
            {buttonLabels.active}
          </button>
          <button
            className={getButtonClass("contained")}
            onClick={() => setSelectedFilter("contained")}
          >
            {buttonLabels.contained}
          </button>
          <button
            className={getButtonClass("extinguished")}
            onClick={() => setSelectedFilter("extinguished")}
          >
            {buttonLabels.extinguished}
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
              onClick={handleReload}
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <div className="fire-alert__map-container">
              <ForestFireMap
                fires={filteredData}
                selectedFireId={selectedFireId}
                onFireSelect={handleFireSelect}
                legendPosition="bottomleft"
              />

              <FireStatusSummary
                level3Count={responseLevelCounts.level3}
                level2Count={responseLevelCounts.level2}
                level1Count={responseLevelCounts.level1}
                initialCount={responseLevelCounts.initial}
              />
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
                  filter={selectedFilter}
                  onFilterChange={setSelectedFilter}
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
