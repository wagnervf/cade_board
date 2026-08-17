import { OperationalStatus } from '../items/items.api';

type StatusItem = {
  status: OperationalStatus;
};

export function prioritizeStoppedItems<T extends StatusItem>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ index, item }))
    .sort((left, right) => {
      const statusPriority =
        Number(right.item.status === 'PARADO') - Number(left.item.status === 'PARADO');

      return statusPriority || left.index - right.index;
    })
    .map(({ item }) => item);
}
