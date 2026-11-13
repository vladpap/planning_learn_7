import {useMemo, useState} from 'react';

import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Selector} from '@astryxdesign/core/Selector';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

import type {PlanData, Week} from '../data/types';

interface WeeksViewProps {
  plan: PlanData;
  completedWeeks: Set<number>;
  onToggleWeek: (weekNumber: number) => void;
}

const ALL_MONTHS = 'Все месяцы';

/** Find the week that contains today, or null outside the school year. */
function findCurrentWeek(weeks: Week[], startYear: number): number | null {
  const today = new Date();

  const toDate = (day: number, month: number) =>
    new Date(month >= 8 ? startYear : startYear + 1, month - 1, day);

  for (const week of weeks) {
    const [start, end] = week.dates.split('–');
    const [startDay, startMonth] = start.split('.').map(Number);
    const [endDay, endMonth] = end.split('.').map(Number);
    if (today >= toDate(startDay, startMonth) && today <= toDate(endDay, endMonth)) {
      return week.number;
    }
  }
  return null;
}

export function WeeksView({plan, completedWeeks, onToggleWeek}: WeeksViewProps) {
  const [monthFilter, setMonthFilter] = useState<string>(ALL_MONTHS);
  const [hideCompleted, setHideCompleted] = useState(false);

  const startYear = Number(plan.schoolYear.start.match(/\d{4}/)?.[0] ?? 2026);
  const currentWeek = useMemo(
    () => findCurrentWeek(plan.weeks, startYear),
    [plan.weeks, startYear],
  );

  const visibleWeeks = plan.weeks.filter(week => {
    if (monthFilter !== ALL_MONTHS && week.month !== monthFilter) return false;
    if (hideCompleted && completedWeeks.has(week.number)) return false;
    return true;
  });

  const doneCount = completedWeeks.size;
  const totalWeeks = plan.weeks.length;

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={1}>План по неделям</Heading>
        <Text type="supporting">
          Темы всех предметов на каждую неделю. Отмечайте пройденное галочкой —
          прогресс сохраняется в браузере.
        </Text>
      </VStack>

      <Card padding={3}>
        <VStack gap={3}>
          <HStack className="filter-row" gap={2} vAlign="center" wrap="wrap">
            <Badge variant="green" label={`Пройдено ${doneCount} из ${totalWeeks}`} />
            {currentWeek !== null && (
              <Badge variant="blue" label={`Сейчас идёт неделя ${currentWeek}`} />
            )}
            {currentWeek !== null && (
              <Button
                label="К текущей неделе"
                size="sm"
                onClick={() =>
                  document
                    .getElementById(`week-${currentWeek}`)
                    ?.scrollIntoView({behavior: 'smooth', block: 'start'})
                }
              />
            )}
          </HStack>
          <HStack className="filter-row" gap={3} vAlign="center" wrap="wrap">
            <Selector
              label="Месяц"
              isLabelHidden
              options={[ALL_MONTHS, ...plan.months]}
              value={monthFilter}
              onChange={value => setMonthFilter(value ?? ALL_MONTHS)}
            />
            <CheckboxInput
              label="Только непройденные"
              value={hideCompleted}
              onChange={setHideCompleted}
            />
          </HStack>
        </VStack>
      </Card>

      <VStack gap={3}>
        {visibleWeeks.map(week => {
          const isDone = completedWeeks.has(week.number);
          const controls = plan.controls.filter(item => item.week === week.number);
          const isCurrent = week.number === currentWeek;

          return (
            <div key={week.number} id={`week-${week.number}`} className="week-anchor">
            <Card
              padding={4}
              variant={isCurrent ? 'blue' : 'default'}
            >
              <VStack gap={3}>
                <HStack hAlign="space-between" vAlign="center" gap={3} wrap="wrap">
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Badge
                      variant={isDone ? 'green' : isCurrent ? 'blue' : 'neutral'}
                      label={`Неделя ${week.number}`}
                    />
                    <Text type="body" weight="semibold">
                      {week.dates}
                    </Text>
                    <Text type="supporting">{week.month}</Text>
                    {week.days < 5 && (
                      <Badge variant="yellow" label={`${week.days} учебных дня`} />
                    )}
                  </HStack>
                  <CheckboxInput
                    label="Пройдено"
                    value={isDone}
                    onChange={() => onToggleWeek(week.number)}
                  />
                </HStack>

                {week.note && <Text type="supporting">{week.note}</Text>}

                <Divider />

                <div className="week-topics">
                  {plan.subjects.map(subject => (
                    <div key={subject.name} className="week-topic">
                      <Text type="supporting" weight="medium">
                        {subject.name}
                      </Text>
                      <Text type="body">{subject.topics[String(week.number)]}</Text>
                    </div>
                  ))}
                </div>

                {controls.length > 0 && (
                  <Card variant="yellow" padding={3}>
                    <VStack gap={2}>
                      <Text type="label">Контрольные и зачёты</Text>
                      {controls.map(item => (
                        <HStack key={`${item.subject}-${item.form}`} gap={2} wrap="wrap">
                          <Badge variant="orange" label={item.subject} />
                          <Text type="supporting">{item.form}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Card>
                )}
              </VStack>
            </Card>
            </div>
          );
        })}
      </VStack>
    </VStack>
  );
}
