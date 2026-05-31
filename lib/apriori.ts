export interface Transaction {
  userId: string;
  items: string[]; // courseIds
}

export interface Rule {
  antecedent: string[];
  consequent: string[];
  confidence: number;
  support: number;
}

// Helper to get all subsets of an array
const getSubsets = (array: string[]): string[][] => {
  return array.reduce(
    (subsets, value) => subsets.concat(subsets.map((set) => [value, ...set])),
    [[]] as string[][]
  );
};

// Helper to check if an array contains another array
const containsAll = (target: string[], search: string[]): boolean => {
  return search.every((v) => target.includes(v));
};

export const generateAprioriRules = (
  transactions: Transaction[],
  minSupport: number = 0.1,
  minConfidence: number = 0.5
): Rule[] => {
  const numTransactions = transactions.length;
  if (numTransactions === 0) return [];

  const minSupportCount = Math.ceil(minSupport * numTransactions);

  // 1. Find frequent 1-itemsets
  const itemCounts: Record<string, number> = {};
  transactions.forEach((t) => {
    t.items.forEach((item) => {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
    });
  });

  const frequent1Itemsets = Object.keys(itemCounts).filter(
    (item) => itemCounts[item] >= minSupportCount
  );

  // For this simple implementation, we'll only look at 2-itemsets (A -> B)
  // to avoid combinatorial explosion in a basic JS environment.
  // In a real big-data scenario, this would loop until no new itemsets are found.
  
  const frequent2Itemsets: { items: string[]; count: number }[] = [];
  
  for (let i = 0; i < frequent1Itemsets.length; i++) {
    for (let j = i + 1; j < frequent1Itemsets.length; j++) {
      const candidate = [frequent1Itemsets[i], frequent1Itemsets[j]];
      
      let count = 0;
      transactions.forEach(t => {
        if (containsAll(t.items, candidate)) count++;
      });

      if (count >= minSupportCount) {
        frequent2Itemsets.push({ items: candidate, count });
      }
    }
  }

  // Generate Rules from frequent 2-itemsets
  const rules: Rule[] = [];

  frequent2Itemsets.forEach(itemset => {
    const support = itemset.count / numTransactions;

    // Rule: itemset.items[0] -> itemset.items[1]
    const countA = itemCounts[itemset.items[0]];
    const conf1 = itemset.count / countA;
    if (conf1 >= minConfidence) {
      rules.push({
        antecedent: [itemset.items[0]],
        consequent: [itemset.items[1]],
        confidence: conf1,
        support,
      });
    }

    // Rule: itemset.items[1] -> itemset.items[0]
    const countB = itemCounts[itemset.items[1]];
    const conf2 = itemset.count / countB;
    if (conf2 >= minConfidence) {
      rules.push({
        antecedent: [itemset.items[1]],
        consequent: [itemset.items[0]],
        confidence: conf2,
        support,
      });
    }
  });

  return rules;
};
