import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { HalfTab } from "../../presentation/SwitchTabs";

type UseScoreTableScrollOptions = {
  focusedIndex: number;
  courseType: HalfTab;
  enabled?: boolean;
};

export function useScoreTableScroll({
  focusedIndex,
  courseType,
  enabled = true,
}: UseScoreTableScrollOptions) {
  const dockRef = useRef<HTMLDivElement>(null);
  const topRegionRef = useRef<HTMLDivElement>(null);
  const upArrowRef = useRef<HTMLButtonElement>(null);
  const scoreInputRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const topSpacerRef = useRef<HTMLDivElement>(null);
  const bottomSpacerRef = useRef<HTMLDivElement>(null);
  const tableHeaderRef = useRef<HTMLDivElement | null>(null);
  const focusedRowRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const [summaryHeight, setSummaryHeight] = useState(0);
  const [dockHeight, setDockHeight] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const topRegion = topRegionRef.current;
    const dock = dockRef.current;

    if (!topRegion || !dock) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === topRegion) {
          setSummaryHeight(entry.contentRect.height);
        } else if (entry.target === dock) {
          setDockHeight(entry.contentRect.height);
        }
      }
    });

    resizeObserver.observe(topRegion);
    resizeObserver.observe(dock);

    setSummaryHeight(topRegion.getBoundingClientRect().height);
    setDockHeight(dock.getBoundingClientRect().height);

    return () => {
      resizeObserver.disconnect();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const currentRow = focusedRowRefs.current.get(focusedIndex);
    const tableWrapper = tableWrapperRef.current;
    const topRegion = topRegionRef.current;
    const upArrow = upArrowRef.current;
    const dock = dockRef.current;
    const scoreInput = scoreInputRef.current;
    const topSpacer = topSpacerRef.current;
    const bottomSpacer = bottomSpacerRef.current;

    if (!currentRow || !tableWrapper || !topRegion || !topSpacer || !bottomSpacer) return;

    const adjustAndScroll = () => {
      const currentTopSpacer = topSpacer.offsetHeight;
      const currentBottomSpacer = bottomSpacer.offsetHeight;
      const rawContentHeight = tableWrapper.scrollHeight - currentTopSpacer - currentBottomSpacer;
      const wrapperHeight = tableWrapper.clientHeight;

      if (rawContentHeight < wrapperHeight) {
        const missing = wrapperHeight - rawContentHeight;
        const spacerHeight = Math.max(missing / 2, 0);
        topSpacer.style.height = `${spacerHeight}px`;
        bottomSpacer.style.height = `${spacerHeight}px`;
      } else {
        topSpacer.style.height = "0px";
        bottomSpacer.style.height = "0px";
      }

      const topRegionRect = topRegion.getBoundingClientRect();
      const bandTopY = topRegionRect.bottom;

      const upTop = upArrow?.getBoundingClientRect().top;
      const cardTop = scoreInput?.getBoundingClientRect().top;
      const dockTop = dock?.getBoundingClientRect().top;
      const candidates = [upTop, cardTop, dockTop].filter((v): v is number => v !== undefined);

      if (candidates.length === 0) {
        return;
      }

      const bandBottomY = Math.min(...candidates) - 8;

      const wrapRect = tableWrapper.getBoundingClientRect();
      const rowRect = currentRow.getBoundingClientRect();

      const rowTopRel = tableWrapper.scrollTop + (rowRect.top - wrapRect.top);
      const rowBottomRel = rowTopRel + rowRect.height;
      const bandTopRel = tableWrapper.scrollTop + (bandTopY - wrapRect.top);
      const bandBottomRel = tableWrapper.scrollTop + (bandBottomY - wrapRect.top);

      const headerHeight = tableHeaderRef.current?.getBoundingClientRect().height ?? 0;
      const topMargin = (focusedIndex === 0 ? headerHeight : 0) + 4;
      const bottomMargin = 4;

      const isWithinBand =
        rowTopRel >= bandTopRel + topMargin &&
        rowBottomRel <= bandBottomRel - bottomMargin;

      if (isWithinBand) {
        return;
      }

      let delta = 0;

      if (rowTopRel < bandTopRel + topMargin) {
        delta = rowTopRel - (bandTopRel + topMargin);
      } else if (rowBottomRel > bandBottomRel - bottomMargin) {
        delta = rowBottomRel - (bandBottomRel - bottomMargin);
      }

      if (delta !== 0) {
        tableWrapper.scrollTo({
          top: tableWrapper.scrollTop + delta,
          behavior: "smooth",
        });
      }
    };

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(adjustAndScroll);
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [focusedIndex, courseType, summaryHeight, dockHeight, enabled]);

  const getRowRef = useCallback((index: number, element: HTMLButtonElement | null) => {
    if (element) {
      focusedRowRefs.current.set(index, element);
    } else {
      focusedRowRefs.current.delete(index);
    }
  }, []);

  const setHeaderRef = useCallback((element: HTMLDivElement | null) => {
    tableHeaderRef.current = element;
  }, []);

  const tableWrapperStyle = useMemo((): CSSProperties => {
    if (!enabled) {
      return {
        height: "auto",
        WebkitOverflowScrolling: "touch",
        scrollPaddingTop: "8px",
        scrollPaddingBottom: "8px",
      };
    }

    return {
      height: summaryHeight > 0 ? `calc(100dvh - ${summaryHeight}px)` : "auto",
      paddingBottom: dockHeight ? `${dockHeight + 16}px` : undefined,
      WebkitOverflowScrolling: "touch",
      scrollPaddingTop: "8px",
      scrollPaddingBottom: dockHeight ? `${dockHeight + 8}px` : "8px",
    };
  }, [summaryHeight, dockHeight, enabled]);

  return {
    topRegionRef,
    dockRef,
    upArrowRef,
    scoreInputRef,
    tableWrapperRef,
    topSpacerRef,
    bottomSpacerRef,
    getRowRef,
    setHeaderRef,
    tableWrapperStyle,
  };
}

export default useScoreTableScroll;
