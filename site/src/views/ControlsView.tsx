import {useMemo, useState} from 'react';

import {Badge} from '@astryxdesign/core/Badge';
import {Selector} from '@astryxdesign/core/Selector';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {pixel, proportional, Table} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Heading, Text} from '@astryxdesign/core/Text';

import type {PlanData} from '../data/types';

interface ControlsViewProps {
  plan: PlanData;
}

type Row = Record<string, unknown>;

const ALL_SUBJECTS = 'Все предметы';

export function ControlsView({plan}: ControlsViewProps) {
  const [subjectFilter, setSubjectFilter] = useState<string>(ALL_SUBJECTS);

  const subjects = useMemo(
    () => Array.from(new Set(plan.controls.map(item => item.subject))),
    [plan.controls],
  );

  const rows: Row[] = plan.controls
    .filter(item => subjectFilter === ALL_SUBJECTS || item.subject === subjectFilter)
    .map(item => ({
      id: `${item.week}-${item.subject}-${item.form}`,
      week: item.week,
      dates: item.dates,
      subject: item.subject,
      form: item.form,
    }));

  const columns: TableColumn<Row>[] = [
    {key: 'week', header: 'Неделя', width: pixel(80)},
    {key: 'dates', header: 'Даты', width: pixel(130)},
    {
      key: 'subject',
      header: 'Предмет',
      width: proportional(1, {minWidth: 150}),
      renderCell: item => <Badge variant="orange" label={String(item.subject)} />,
    },
    {key: 'form', header: 'Что проверяет', width: proportional(2, {minWidth: 220})},
  ];

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={1}>Контрольные точки года</Heading>
        <Text type="supporting">
          Всего {plan.controls.length} контрольные точки: стартовая диагностика,
          проверочные после блоков, четвертные и итоговые. Даты можно сдвигать на
          одну-две недели.
        </Text>
      </VStack>

      <HStack gap={2} vAlign="center" wrap="wrap">
        <Text type="supporting">Фильтр по предмету</Text>
        <Selector
          label="Фильтр по предмету"
          isLabelHidden
          options={[ALL_SUBJECTS, ...subjects]}
          value={subjectFilter}
          onChange={value => setSubjectFilter(value ?? ALL_SUBJECTS)}
        />
      </HStack>

      <Card padding={0}>
        <Table
          data={rows}
          columns={columns}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
          textOverflow="wrap"
        />
      </Card>
    </VStack>
  );
}
