import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TestSetManager from './test-set-manager';
import TestExecutor from './test-executor';
import ResultsAnalyzer from './results-analyzer';
import VersionManager from './version-manager';
import Sidebar from './app-sidebar';
import {
  RiDashboard2Line,
  RiDashboard2Fill,
  RiPlayLine,
  RiPlayFill,
  RiFileListLine,
  RiFileListFill,
} from '@remixicon/react';
import { Outlet } from 'react-router-dom';

const getNavigation = () => [
  {
    name: '评测集',
    value: 'testset',
    href: `/debugging/testset`,
    icon: RiDashboard2Line,
    selectedIcon: RiDashboard2Fill,
  },
  {
    name: '执行',
    value: 'execution',
    href: `/debugging/execution`,
    icon: RiPlayLine,
    selectedIcon: RiPlayFill,
  },
  {
    name: '结果',
    value: 'results',
    href: `/debugging/results`,
    icon: RiFileListLine,
    selectedIcon: RiFileListFill,
  },
];

export default function Debugging() {
  const [activeTab, setActiveTab] = useState('test-sets');

  return (
    <div className="flex h-full flex-col ">
      <div className="relative flex overflow-hidden h-full bg-white">
        <Sidebar navigation={getNavigation()} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
