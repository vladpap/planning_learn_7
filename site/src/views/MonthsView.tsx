import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

import type {PlanData} from '../data/types';

interface MonthsViewProps {
  plan: PlanData;
}

export function MonthsView({plan}: MonthsViewProps) {
  const weeksInMonth = (month: string) =>
    plan.weeks.filter(week => week.month === month).length;

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={1}>План по месяцам</Heading>
        <Text type="supporting">
          Что осваиваем в каждом месяце. Полная разбивка по неделям — на экране
          «По неделям».
        </Text>
      </VStack>

      <VStack gap={4}>
        {plan.months.map(month => (
          <Card key={month} padding={4}>
            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <Heading level={3}>{month}</Heading>
                <Badge variant="neutral" label={`${weeksInMonth(month)} нед.`} />
              </HStack>
              <Divider />
              <div className="week-topics">
                {plan.subjects.map(subject => (
                  <div key={subject.name} className="week-topic">
                    <Text type="supporting" weight="medium">
                      {subject.name}
                    </Text>
                    <Text type="body">{subject.monthly[month]}</Text>
                  </div>
                ))}
              </div>
            </VStack>
          </Card>
        ))}
      </VStack>
    </VStack>
  );
}
