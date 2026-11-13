import {useEffect, useMemo, useState} from 'react';

import {AppShell} from '@astryxdesign/core/AppShell';
import {SideNav, SideNavHeading, SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {VStack} from '@astryxdesign/core/Stack';
import {
  AcademicCapIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  HomeIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline';

import planJson from './data/plan.json';
import type {PlanData, ViewId} from './data/types';
import {ControlsView} from './views/ControlsView';
import {DocumentView} from './views/DocumentView';
import {MonthsView} from './views/MonthsView';
import {Overview} from './views/Overview';
import {SubjectsView} from './views/SubjectsView';
import {WeeksView} from './views/WeeksView';

const plan = planJson as PlanData;

const STORAGE_KEY = 'plan7-completed-weeks';

interface ViewDefinition {
  id: ViewId;
  label: string;
  icon: typeof HomeIcon;
}

const PLAN_VIEWS: ViewDefinition[] = [
  {id: 'overview', label: 'Обзор', icon: HomeIcon},
  {id: 'months', label: 'По месяцам', icon: CalendarDaysIcon},
  {id: 'weeks', label: 'По неделям', icon: QueueListIcon},
  {id: 'controls', label: 'Контрольные', icon: ClipboardDocumentCheckIcon},
  {id: 'subjects', label: 'Предметы', icon: BookOpenIcon},
];

const DOCUMENT_VIEW: ViewDefinition = {
  id: 'document',
  label: 'Документ',
  icon: DocumentTextIcon,
};

/** Read completed weeks from localStorage, ignoring broken values. */
function readCompletedWeeks(): number[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is number => typeof value === 'number');
  } catch {
    return [];
  }
}

const VALID_VIEWS: ViewId[] = ['overview', 'months', 'weeks', 'controls', 'subjects', 'document'];

/** Read the view id from the URL hash, so every screen has a shareable link. */
function readViewFromHash(): ViewId {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return VALID_VIEWS.includes(hash as ViewId) ? (hash as ViewId) : 'overview';
}

export function App() {
  const [activeView, setActiveView] = useState<ViewId>(readViewFromHash);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>(readCompletedWeeks);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completedWeeks));
  }, [completedWeeks]);

  useEffect(() => {
    if (window.location.hash !== `#/${activeView}`) {
      window.location.hash = `#/${activeView}`;
    }
  }, [activeView]);

  useEffect(() => {
    const onHashChange = () => setActiveView(readViewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const toggleWeek = (weekNumber: number) => {
    setCompletedWeeks(current =>
      current.includes(weekNumber)
        ? current.filter(number => number !== weekNumber)
        : [...current, weekNumber],
    );
  };

  const completedSet = useMemo(() => new Set(completedWeeks), [completedWeeks]);

  const sideNav = (
    <SideNav
      header={
        <SideNavHeading
          heading="7 класс"
          headingHref="./"
          icon={
            <NavIcon
              icon={<AcademicCapIcon style={{width: 16, height: 16}} />}
            />
          }
        />
      }
      collapsible
    >
      <SideNavSection title="План">
        {PLAN_VIEWS.map(view => (
          <SideNavItem
            key={view.id}
            label={view.label}
            icon={view.icon}
            isSelected={activeView === view.id}
            onClick={() => setActiveView(view.id)}
          />
        ))}
      </SideNavSection>
      <SideNavSection title="Материалы">
        <SideNavItem
          label={DOCUMENT_VIEW.label}
          icon={DOCUMENT_VIEW.icon}
          isSelected={activeView === DOCUMENT_VIEW.id}
          onClick={() => setActiveView(DOCUMENT_VIEW.id)}
        />
      </SideNavSection>
    </SideNav>
  );

  return (
    <AppShell height="auto" sideNav={sideNav}>
      <VStack className="page" padding={6} gap={6}>
        {activeView === 'overview' && <Overview plan={plan} onNavigate={setActiveView} />}
        {activeView === 'months' && <MonthsView plan={plan} />}
        {activeView === 'weeks' && (
          <WeeksView
            plan={plan}
            completedWeeks={completedSet}
            onToggleWeek={toggleWeek}
          />
        )}
        {activeView === 'controls' && <ControlsView plan={plan} />}
        {activeView === 'subjects' && <SubjectsView plan={plan} />}
        {activeView === 'document' && <DocumentView />}
      </VStack>
    </AppShell>
  );
}
