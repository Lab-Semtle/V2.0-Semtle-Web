import { useState } from 'react';

export interface Tab {
  label: string;
  value: string;
  subRoutes?: string[];
  href?: string;
}

export default function useTabs({
  tabs,
  initialTabId,
  onChange
}: {
  tabs: Tab[];
  initialTabId: string;
  onChange?: (id: string) => void;
}) {
  const [[selectedTabIndex, direction], setSelectedTab] = useState(() => {
    const indexOfInitialTab = tabs.findIndex((tab) => tab.value === initialTabId);
    // initialTabId가 빈 문자열이면 -1 반환 (아무 탭도 선택되지 않음)
    return [initialTabId === '' ? -1 : (indexOfInitialTab === -1 ? -1 : indexOfInitialTab), 0];
  });

  return {
    tabProps: {
      tabs,
      selectedTabIndex,
      onChange,
      setSelectedTab
    },
    selectedTab: tabs[selectedTabIndex],
    contentProps: {
      direction,
      selectedTabIndex
    }
  };
}

