import {Card} from '@astryxdesign/core/Card';
import {pixel, proportional, Table} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

import type {PlanData} from '../data/types';

interface SubjectsViewProps {
  plan: PlanData;
}

type Row = Record<string, unknown>;

export function SubjectsView({plan}: SubjectsViewProps) {
  const columns: TableColumn<Row>[] = [
    {key: 'name', header: 'Предмет', width: pixel(190)},
    {key: 'weekly', header: 'Уроков в неделю', width: pixel(140), align: 'center'},
    {key: 'annual', header: 'Часов в год', width: pixel(100), align: 'center'},
    {key: 'focus', header: 'Основное содержание', width: proportional(2, {minWidth: 220})},
    {key: 'result', header: 'Что проверяем в конце года', width: proportional(2, {minWidth: 220})},
  ];

  const rows: Row[] = plan.subjects.map(subject => ({
    id: subject.name,
    name: subject.name,
    weekly: subject.weeklyHours,
    annual: subject.annualHours,
    focus: subject.focus,
    result: subject.yearResult,
  }));

  const totalWeekly = plan.subjects.reduce((sum, subject) => sum + subject.weeklyHours, 0);
  const totalAnnual = plan.subjects.reduce((sum, subject) => sum + subject.annualHours, 0);

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={1}>Предметы и часы</Heading>
        <Text type="supporting">
          {totalWeekly} уроков в неделю, {totalAnnual} часов за год. Состав — только
          основные предметы, без ИЗО, музыки, технологии и физкультуры.
        </Text>
      </VStack>
      <Card padding={0}>
        <Table
          data={rows}
          columns={columns}
          idKey="id"
          density="compact"
          dividers="grid"
          isStriped
          textOverflow="wrap"
        />
      </Card>
    </VStack>
  );
}
