"use server";

import { db } from "@/lib/db";
import { generateAprioriRules, Transaction } from "@/lib/apriori";

export const getRecommendations = async (userId: string) => {
  try {
    // 1. Fetch all purchases
    const allPurchases = await db.purchase.findMany({
      select: {
        userId: true,
        courseId: true,
      }
    });

    // 2. Group by user to form transactions
    const userTransactions: Record<string, string[]> = {};
    allPurchases.forEach(p => {
      if (!userTransactions[p.userId]) {
        userTransactions[p.userId] = [];
      }
      userTransactions[p.userId].push(p.courseId);
    });

    const transactions: Transaction[] = Object.keys(userTransactions).map(uid => ({
      userId: uid,
      items: userTransactions[uid]
    }));

    // 3. Generate Rules (In production, this would be a cron job caching to db.AprioriRule)
    // For this implementation, we compute dynamically if transactions aren't too large
    // minSupport = 0.1 (10% of users), minConfidence = 0.5 (50%)
    const rules = generateAprioriRules(transactions, 0.1, 0.5);

    // 4. Find what the current user owns
    const userOwnedCourses = userTransactions[userId] || [];
    
    // 5. Find recommendations
    const recommendedCourseIds = new Set<string>();

    rules.forEach(rule => {
      // If user owns the antecedent (e.g. Advanced Java)
      const ownsAntecedent = rule.antecedent.every(cId => userOwnedCourses.includes(cId));
      if (ownsAntecedent) {
        // And does NOT own the consequent (e.g. Data Warehouse)
        rule.consequent.forEach(cId => {
          if (!userOwnedCourses.includes(cId)) {
            recommendedCourseIds.add(cId);
          }
        });
      }
    });

    if (recommendedCourseIds.size === 0) return [];

    // 6. Fetch full course details for recommendations
    const recommendedCourses = await db.course.findMany({
      where: {
        id: {
          in: Array.from(recommendedCourseIds)
        },
        isPublished: true,
        reviewStatus: {
          notIn: ["FLAGGED", "REJECTED"]
        },
      },
      include: {
        category: true,
        chapters: {
          where: {
            isPublished: true
          },
          select: {
            id: true
          }
        }
      }
    });

    return recommendedCourses.map((course) => ({
      ...course,
      progress: null,
    }));
  } catch (error) {
    console.error("[GET_RECOMMENDATIONS]", error);
    return [];
  }
};
