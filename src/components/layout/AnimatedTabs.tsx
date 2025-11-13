'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, Transition } from 'framer-motion';
import useTabs, { type Tab } from '@/hooks/useTabs';
import { cn } from '@/lib/utils';

interface AnimatedTabsProps {
  tabs: Tab[];
  value?: string;
  onValueChange?: (value: string) => void;
}

const transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.15
};

const getHoverAnimationProps = (hoveredRect: DOMRect, navRect: DOMRect) => ({
  x: hoveredRect.left - navRect.left - 10,
  y: hoveredRect.top - navRect.top - 4,
  width: hoveredRect.width + 20,
  height: hoveredRect.height + 10
});

const Tabs = ({ tabs, selectedTabIndex, setSelectedTab, onValueChange }: { tabs: Tab[]; selectedTabIndex: number; setSelectedTab: (input: [number, number]) => void; onValueChange?: (value: string) => void }) => {
  const [buttonRefs, setButtonRefs] = React.useState<Array<HTMLElement | null>>([]);

  React.useEffect(() => {
    setButtonRefs((prev) => prev.slice(0, tabs.length));
  }, [tabs.length]);

  const navRef = React.useRef<HTMLDivElement>(null);
  const navRect = navRef.current?.getBoundingClientRect();

  const selectedRect = buttonRefs[selectedTabIndex]?.getBoundingClientRect();

  const [hoveredTabIndex, setHoveredTabIndex] = React.useState<number | null>(null);
  const hoveredRect = buttonRefs[hoveredTabIndex ?? -1]?.getBoundingClientRect();

  const handleTabClick = (i: number) => {
    setSelectedTab([i, i > selectedTabIndex ? 1 : -1]);
    if (onValueChange) {
      onValueChange(tabs[i].value);
    }
  };

  return (
    <nav
      ref={navRef}
      className="flex flex-shrink-0 justify-start items-center relative pt-1 pb-2"
      onPointerLeave={() => setHoveredTabIndex(null)}>
      {tabs.map((item, i) => {
        const isActive = selectedTabIndex === i && selectedTabIndex !== -1;
        const isHovered = hoveredTabIndex === i;
        const hasHref = !!item.href;

        const commonProps = {
          className: "relative rounded-md flex items-center h-7 md:h-8 px-2 md:px-4 z-20 bg-transparent cursor-pointer select-none transition-colors",
          onPointerEnter: () => setHoveredTabIndex(i),
          onFocus: () => setHoveredTabIndex(i),
          onClick: () => handleTabClick(i)
        };

        const content = (
          <motion.span
            ref={(el) => {
              buttonRefs[i] = el as HTMLElement;
            }}
            className={cn('block text-xs md:text-sm transition-colors duration-200', {
              'text-muted-foreground': !isActive && !isHovered,
              'text-foreground/70': !isActive && isHovered,
              'text-foreground font-semibold': isActive
            })}>
            <span>{item.label}</span>
          </motion.span>
        );

        return hasHref ? (
          <Link key={item.value} href={item.href || '#'} {...commonProps}>
            {content}
          </Link>
        ) : (
          <button key={item.value} type="button" {...commonProps}>
            {content}
          </button>
        );
      })}

      <AnimatePresence>
        {hoveredRect && navRect && (
          <motion.div
            key="hover"
            className="absolute z-10 top-0 left-0 rounded-md bg-secondary"
            initial={{ ...getHoverAnimationProps(hoveredRect, navRect), opacity: 0 }}
            animate={{ ...getHoverAnimationProps(hoveredRect, navRect), opacity: 1 }}
            exit={{ ...getHoverAnimationProps(hoveredRect, navRect), opacity: 0 }}
            transition={transition as Transition<Record<string, unknown>>}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRect && navRect && selectedTabIndex !== -1 && (
          <motion.div
            className="absolute z-10 bottom-0 left-0 h-[2px] bg-foreground"
            initial={false}
            animate={{
              width: selectedRect.width + 18,
              x: `calc(${selectedRect.left - navRect.left - 9}px)`,
              opacity: 1
            }}
            transition={transition as Transition<Record<string, unknown>>}
          />
        )}
      </AnimatePresence>
    </nav>
  );
};

export function AnimatedTabs({ tabs, value, onValueChange }: AnimatedTabsProps) {
  const pathname = usePathname();
  const isControlled = value !== undefined && onValueChange !== undefined;
  const hasHrefs = tabs.some(tab => tab.href);

  const [hookProps] = React.useState(() => {
    if (isControlled) {
      // 컨트롤 모드: value prop으로 초기 탭 결정
      return {
        tabs: tabs.map(({ label, value, subRoutes, href }) => ({
          label,
          value,
          subRoutes,
          href
        })),
        initialTabId: value || ''
      };
    } else {
      // 네비게이션 모드: 현재 경로에 따라 초기 탭 결정
      const currentPath = pathname || '/';
      const initialTab = tabs.find(
        (tab) => tab.href && currentPath.startsWith(tab.href)
      );

      return {
        tabs: tabs.map(({ label, value, subRoutes, href }) => ({
          label,
          value,
          subRoutes,
          href
        })),
        initialTabId: initialTab?.value || ''
      };
    }
  });

  const framer = useTabs(hookProps);

  // 컨트롤 모드: value prop 변경 감지
  React.useEffect(() => {
    if (isControlled && value !== undefined) {
      const activeTabIndex = tabs.findIndex(tab => tab.value === value);
      if (activeTabIndex !== -1 && activeTabIndex !== framer.tabProps.selectedTabIndex) {
        framer.tabProps.setSelectedTab([activeTabIndex, activeTabIndex > framer.tabProps.selectedTabIndex ? 1 : -1]);
      }
    }
  }, [value, isControlled, tabs, framer.tabProps]);

  // 네비게이션 모드: 경로 변경 감지하여 탭 업데이트
  React.useEffect(() => {
    if (isControlled || !hasHrefs || !pathname) return;

    const activeTabIndex = tabs.findIndex(
      (tab) => tab.href && pathname.startsWith(tab.href)
    );

    // 활동, 프로젝트, 자료실 페이지가 아닌 경우 -1로 설정하여 아무 탭도 선택되지 않도록
    if (activeTabIndex === -1) {
      // 현재 선택된 탭이 있다면 선택 해제
      if (framer.tabProps.selectedTabIndex !== -1) {
        framer.tabProps.setSelectedTab([-1, 0]);
      }
    } else if (activeTabIndex !== framer.tabProps.selectedTabIndex) {
      framer.tabProps.setSelectedTab([activeTabIndex, activeTabIndex > framer.tabProps.selectedTabIndex ? 1 : -1]);
    }
  }, [pathname, tabs, framer.tabProps, isControlled, hasHrefs]);

  return (
    <div className="relative flex w-full items-start justify-start overflow-x-auto overflow-y-hidden">
      <div className="w-full">
        <Tabs {...framer.tabProps} onValueChange={onValueChange} />
      </div>
    </div>
  );
}

