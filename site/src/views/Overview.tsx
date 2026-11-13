import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {pixel, proportional, Table} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Heading, Text} from '@astryxdesign/core/Text';

import type {PlanData, ViewId} from '../data/types';

interface OverviewProps {
  plan: PlanData;
  onNavigate: (view: ViewId) => void;
}

interface Stat {
  label: string;
  value: string;
  hint: string;
}

interface ScheduleRow extends Record<string, unknown> {
  day: string;
  lessons: string;
}

interface VacationRow extends Record<string, unknown> {
  name: string;
  dates: string;
  length: string;
}

const SCHEDULE_COLUMNS: TableColumn<ScheduleRow>[] = [
  {key: 'day', header: 'День', width: pixel(140)},
  {key: 'lessons', header: 'Уроки', width: proportional(1)},
];

const VACATION_COLUMNS: TableColumn<VacationRow>[] = [
  {key: 'name', header: 'Каникулы', width: proportional(1)},
  {key: 'dates', header: 'Даты', width: proportional(2)},
  {key: 'length', header: 'Длительность', width: pixel(120)},
];

const RULES: {title: string; text: string}[] = [
  {
    title: 'Лист «По неделям»',
    text: 'Основной рабочий экран: темы всех предметов на каждую учебную неделю и отметка «пройдено».',
  },
  {
    title: 'Лист «По месяцам»',
    text: 'Обзор: что должно быть освоено за месяц по каждому предмету.',
  },
  {
    title: 'Лист «Контрольные»',
    text: 'Даты проверочных и итоговых работ. Их можно сдвигать на одну-две недели.',
  },
  {
    title: 'Если отстаём',
    text: 'Не догоняйте всё сразу: сдвиньте темы на неделю, но сохраните контрольные точки.',
  },
  {
    title: 'Раз в месяц',
    text: 'Сверяйтесь с планом по месяцам и отмечайте пройденные недели.',
  },
];

export function Overview({plan, onNavigate}: OverviewProps) {
  const stats: Stat[] = [
    {
      label: 'Учебных недель',
      value: String(plan.schoolYear.weeks),
      hint: '34 полные недели',
    },
    {
      label: 'Учебных дней',
      value: String(plan.schoolYear.study_days),
      hint: 'по пятидневке',
    },
    {
      label: 'Уроков в неделю',
      value: String(plan.schoolYear.weekly_hours),
      hint: '4–5 в день',
    },
    {
      label: 'Часов за год',
      value: '782',
      hint: 'по основным предметам',
    },
    {
      label: 'Контрольных точек',
      value: String(plan.controls.length),
      hint: 'включая итоговые',
    },
  ];

  const scheduleRows: ScheduleRow[] = plan.schedule.map(item => ({
    day: item.day,
    lessons: item.lessons.join(' · '),
  }));

  const vacationRows: VacationRow[] = plan.vacations.map(item => ({
    name: item.name,
    dates: item.dates,
    length: item.length,
  }));

  return (
    <VStack gap={6}>
      <VStack gap={2}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Heading level={1}>{plan.schoolYear.title}</Heading>
          <Badge variant="blue" label="2026/2027" />
        </HStack>
        <Text type="body" color="secondary">
          Семейное образование · пятидневная неделя · основные предметы ·{' '}
          {plan.schoolYear.start} — {plan.schoolYear.end}
        </Text>
        <HStack gap={2} wrap="wrap">
          <Button label="Открыть недели" variant="primary" onClick={() => onNavigate('weeks')} />
          <Button label="По месяцам" onClick={() => onNavigate('months')} />
          <Button label="Контрольные" onClick={() => onNavigate('controls')} />
        </HStack>
      </VStack>

      <Grid columns={{minWidth: 180, max: 5}} gap={3}>
        {stats.map(stat => (
          <Card key={stat.label} padding={4}>
            <VStack gap={1}>
              <Text type="supporting">{stat.label}</Text>
              <Heading level={3}>{stat.value}</Heading>
              <Text type="supporting" size="sm">
                {stat.hint}
              </Text>
            </VStack>
          </Card>
        ))}
      </Grid>

      <VStack gap={3}>
        <Heading level={2}>Учебная неделя</Heading>
        <Text type="supporting">
          Один урок — 30–40 минут, между уроками перерыв 10–15 минут. Порядок
          уроков внутри дня можно менять: главное — сохранить число уроков по
          предмету за неделю.
        </Text>
        <Card padding={0}>
          <Table
            data={scheduleRows}
            columns={SCHEDULE_COLUMNS}
            idKey="day"
            density="compact"
            dividers="rows"
          />
        </Card>
      </VStack>

      <HStack gap={6} vAlign="start" wrap="wrap">
        <VStack gap={3} width={520}>
          <Heading level={2}>Каникулы</Heading>
          <Card padding={0}>
            <Table
              data={vacationRows}
              columns={VACATION_COLUMNS}
              idKey="name"
              density="compact"
              dividers="rows"
            />
          </Card>
        </VStack>

        <VStack gap={3} width={520}>
          <Heading level={2}>Как работать с планом</Heading>
          <VStack gap={3}>
            {RULES.map((rule, index) => (
              <HStack key={rule.title} gap={3} vAlign="start">
                <Badge variant="neutral" label={String(index + 1)} />
                <VStack gap={1}>
                  <Text type="body" weight="semibold">
                    {rule.title}
                  </Text>
                  <Text type="supporting">{rule.text}</Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </HStack>
    </VStack>
  );
}
