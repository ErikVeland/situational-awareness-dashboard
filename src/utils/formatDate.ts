/**
 * Returns the English ordinal suffix for a day number.
 *
 * @example dayOrdinal(1) → 'st', dayOrdinal(11) → 'th', dayOrdinal(22) → 'nd'
 */
export function dayOrdinal(n: number): string {
  const rules = new Intl.PluralRules('en', { type: 'ordinal' });
  const suffixes: Record<string, string> = {
    one: 'st',
    two: 'nd',
    few: 'rd',
    other: 'th',
  };
  return suffixes[rules.select(n)] ?? 'th';
}
