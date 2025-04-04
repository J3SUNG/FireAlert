import React from "react";
import { ForestFireList } from "../../features/forest-fire-list";
import { ForestFireMap } from "../../features/forest-fire-map";
import { FireStatusSummary } from "../../shared";
import { useForestFireData } from "../../features/forest-fire-data";
import { useCurrentTime, useFireFilterAndSelection } from "../../shared/lib";
import "./fire-alert.css";

/**
 * 산불 알림 메인 페이지 컴포넌트
 * 전국의 산불 현황을 지도와 목록 형태로 보여주며, 상태별 필터링을 제공합니다.
 * @returns {JSX.Element} 산불 알림 페이지 UI
 */
const FireAlertPage: React.FC = () => {
  const { fires, loading, error, statusCounts, responseLevelCounts, handleReload } =
    useForestFireData();

  const {
    selectedFilter,
    setSelectedFilter,
    selectedFireId,
    filteredData,
    handleFireSelect,
    getButtonClass,
    getFilterButtonLabels,
  } = useFireFilterAndSelection(fires);

  const { currentTime, formatDate } = useCurrentTime();

  const buttonLabels = getFilterButtonLabels(statusCounts);



  return (
    <div className="fire-alert">
      <header className="fire-alert__header">
        <div className="fire-alert__logo-container">
          <div className="fire-alert__logo-icon">🔥</div>
          <h1 className="fire-alert__logo-text">
            <span className="fire-alert__logo-text--fire">불씨</span>알림
          </h1>
          <span className="fire-alert__subtitle">전국 산불 모니터링 시스템</span>
        </div>

        <div className="fire-alert__filter-container">
          <button className={getButtonClass("all")} onClick={() => setSelectedFilter("all")} data-filter="all">
            {buttonLabels.all}
          </button>
          <button className={getButtonClass("active")} onClick={() => setSelectedFilter("active")} data-filter="active">
            {buttonLabels.active}
          </button>
          <button
            className={getButtonClass("contained")}
            onClick={() => setSelectedFilter("contained")}
            data-filter="contained"
          >
            {buttonLabels.contained}
          </button>
          <button
            className={getButtonClass("extinguished")}
            onClick={() => setSelectedFilter("extinguished")}
            data-filter="extinguished"
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
            <button className="fire-alert__retry-button" onClick={handleReload}>
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
                selectedFilter={selectedFilter}
                filteredFires={filteredData}
              />
            </div>

            <div className="fire-alert__sidebar">
              <div className="fire-alert__sidebar-header">
                <h2 className="fire-alert__sidebar-title">산불 데이터 현황</h2>
                <p className="fire-alert__sidebar-subtitle">
                  {filteredData.length === 0 ? (
                    selectedFilter === "all" ?
                      "현재 진행 중인 산불이 없습니다." :
                      `현재 ${selectedFilter === "active" ? "진화중인" : selectedFilter === "contained" ? "통제중인" : "진화완료된"} 산불이 없습니다.`
                  ) : (
                    selectedFilter === "all" ?
                      `현재 ${String(filteredData.length)}건의 산불 정보가 표시되고 있습니다.` :
                      `현재 ${selectedFilter === "active" ? "진화중인" : selectedFilter === "contained" ? "통제중인" : "진화완료된"} 산불 ${String(filteredData.length)}건이 표시되고 있습니다.`
                  )}
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