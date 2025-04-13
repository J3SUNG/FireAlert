import React, { FC, useMemo } from "react";
import { ForestFireItem } from "./ForestFireItem";
import { ForestFireListProps } from "../model/types";
import { Button } from "../../../shared/ui/components";
import "./ForestFireList.css";

/**
 * 산불 목록 컴포넌트
 * 산불 데이터 목록과 필터링 기능을 제공합니다.
 * 메모이제이션을 적용하여 불필요한 렌더링을 방지합니다.
 *
 * @param props 산불 목록 속성
 * @returns {JSX.Element} 산불 목록 컴포넌트
 */
export const ForestFireList: FC<ForestFireListProps> = React.memo(
  ({ fires, onFireSelect, selectedFireId, showFilter = true, filter = "all", onFilterChange }) => {
    /**
     * 컨텐츠 영역의 CSS 클래스명 계산
     * 필터 표시 여부에 따라 적절한 클래스를 반환합니다.
     */
    const contentClass = useMemo(() => {
      let className = "forest-fire-list__content";

      if (showFilter) {
        className += " forest-fire-list__content--with-filter";
      } else {
        className += " forest-fire-list__content--without-filter";
      }

      return className;
    }, [showFilter]);

    /**
     * 필터 변경 핸들러
     * 메모이제이션을 적용하여 불필요한 함수 재생성을 방지합니다.
     */
    const handleFilterChange = useMemo(() => {
      return (newFilter: "all" | "active" | "contained" | "extinguished") => {
        if (onFilterChange) {
          onFilterChange(newFilter);
        }
      };
    }, [onFilterChange]);

    /**
     * 빈 목록 메시지
     * 필터에 따른 메시지를 메모이제이션하여 불필요한 연산을 방지합니다.
     */
    const emptyMessage = useMemo(() => {
      return filter === "all"
        ? "현재 진행 중인 산불이 없습니다."
        : `현재 ${
            filter === "active" ? "진화중인" : filter === "contained" ? "통제중인" : "진화완료된"
          } 산불이 없습니다.`;
    }, [filter]);

    return (
      <div className="forest-fire-list">
        {showFilter && (
          <div className="forest-fire-list__filter-container">
            <div className="forest-fire-list__button-group">
              <Button
                variant="all"
                isActive={filter === "all"}
                onClick={() => handleFilterChange("all")}
                className="fire-alert__button--small"
              >
                전체
              </Button>
              <Button
                variant="active"
                isActive={filter === "active"}
                onClick={() => handleFilterChange("active")}
                className="fire-alert__button--small"
              >
                진행중
              </Button>
              <Button
                variant="contained"
                isActive={filter === "contained"}
                onClick={() => handleFilterChange("contained")}
                className="fire-alert__button--small"
              >
                통제중
              </Button>
              <Button
                variant="extinguished"
                isActive={filter === "extinguished"}
                onClick={() => handleFilterChange("extinguished")}
                className="fire-alert__button--small"
              >
                진화완료
              </Button>
            </div>
          </div>
        )}

        <div className={contentClass}>
          {fires.length > 0 ? (
            <div className="forest-fire-list__items">
              {fires.map((fire) => (
                <ForestFireItem
                  key={fire.id}
                  fire={fire}
                  onSelect={onFireSelect}
                  isSelected={selectedFireId === fire.id}
                />
              ))}
            </div>
          ) : (
            <div className="forest-fire-list__empty-message">{emptyMessage}</div>
          )}
        </div>
      </div>
    );
  }
);
