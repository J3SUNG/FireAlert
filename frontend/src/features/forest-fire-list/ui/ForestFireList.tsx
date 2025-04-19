import React, { FC, useMemo, useCallback } from "react";
import { ForestFireItem } from "./ForestFireItem";
import { ForestFireListProps } from "../model/types";
import { Button } from "../../../shared/ui/components";
import { FireFilterType } from "../../../shared/model/filterTypes";
import "./ForestFireList.css";

/**
 * 산불 목록 컴포넌트
 * 산불 데이터 목록과 필터링 기능을 제공합니다.
 */
export const ForestFireList: FC<ForestFireListProps> = React.memo(
  ({
    fires,
    onFireSelect,
    selectedFireId,
    showFilter = true,
    filter = FireFilterType.ALL,
    onFilterChange,
  }) => {
    const contentClass = useMemo(() => {
      let className = "forest-fire-list__content";

      if (showFilter) {
        className += " forest-fire-list__content--with-filter";
      } else {
        className += " forest-fire-list__content--without-filter";
      }

      return className;
    }, [showFilter]);

    const handleFilterChange = useCallback(
      (newFilter: FireFilterType) => {
        if (onFilterChange) {
          onFilterChange(newFilter);
        }
      },
      [onFilterChange]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent, newFilter: FireFilterType) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleFilterChange(newFilter);
        }
      },
      [handleFilterChange]
    );

    const emptyMessage = useMemo(() => {
      return filter === FireFilterType.ALL
        ? "현재 진행 중인 산불이 없습니다."
        : `현재 ${
            filter === FireFilterType.ACTIVE
              ? "진화중인"
              : filter === FireFilterType.CONTAINED
              ? "통제중인"
              : "진화완료된"
          } 산불이 없습니다.`;
    }, [filter]);

    const getFilterLabel = useCallback((filterType: FireFilterType) => {
      switch (filterType) {
        case FireFilterType.ALL:
          return "모든 산불 데이터 보기";
        case FireFilterType.ACTIVE:
          return "진행중인 산불만 보기";
        case FireFilterType.CONTAINED:
          return "통제중인 산불만 보기";
        case FireFilterType.EXTINGUISHED:
          return "진화완료된 산불만 보기";
        default:
          return "산불 데이터 필터링";
      }
    }, []);

    return (
      <div className="forest-fire-list">
        {showFilter && (
          <div
            className="forest-fire-list__filter-container"
            role="toolbar"
            aria-label="산불 데이터 필터"
          >
            <div className="forest-fire-list__button-group">
              <Button
                variant="all"
                isActive={filter === FireFilterType.ALL}
                onClick={() => handleFilterChange(FireFilterType.ALL)}
                onKeyDown={(e) => handleKeyDown(e, FireFilterType.ALL)}
                ariaLabel={getFilterLabel(FireFilterType.ALL)}
                className="fire-alert__button--small"
              >
                전체
              </Button>
              <Button
                variant="active"
                isActive={filter === FireFilterType.ACTIVE}
                onClick={() => handleFilterChange(FireFilterType.ACTIVE)}
                onKeyDown={(e) => handleKeyDown(e, FireFilterType.ACTIVE)}
                ariaLabel={getFilterLabel(FireFilterType.ACTIVE)}
                className="fire-alert__button--small"
              >
                진행중
              </Button>
              <Button
                variant="contained"
                isActive={filter === FireFilterType.CONTAINED}
                onClick={() => handleFilterChange(FireFilterType.CONTAINED)}
                onKeyDown={(e) => handleKeyDown(e, FireFilterType.CONTAINED)}
                ariaLabel={getFilterLabel(FireFilterType.CONTAINED)}
                className="fire-alert__button--small"
              >
                통제중
              </Button>
              <Button
                variant="extinguished"
                isActive={filter === FireFilterType.EXTINGUISHED}
                onClick={() => handleFilterChange(FireFilterType.EXTINGUISHED)}
                onKeyDown={(e) => handleKeyDown(e, FireFilterType.EXTINGUISHED)}
                ariaLabel={getFilterLabel(FireFilterType.EXTINGUISHED)}
                className="fire-alert__button--small"
              >
                진화완료
              </Button>
            </div>
          </div>
        )}

        <div
          className={contentClass}
          role="region"
          aria-label={`${
            filter === FireFilterType.ALL
              ? "모든"
              : filter === FireFilterType.ACTIVE
              ? "진행중인"
              : filter === FireFilterType.CONTAINED
              ? "통제중인"
              : "진화완료된"
          } 산불 목록`}
        >
          {fires.length > 0 ? (
            <ul
              className="forest-fire-list__items"
              role="list"
              aria-label={`산불 목록: ${fires.length}건`}
            >
              {fires.map((fire) => (
                <li key={fire.id} role="listitem">
                  <ForestFireItem
                    fire={fire}
                    onSelect={onFireSelect}
                    isSelected={selectedFireId === fire.id}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="forest-fire-list__empty-message" aria-live="polite">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    );
  }
);
