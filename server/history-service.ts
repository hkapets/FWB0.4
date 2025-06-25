import { db } from "./storage";
import { changeHistory, type InsertChangeHistory } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export class HistoryService {
  // Логування зміни
  async logChange(
    entityType: string,
    entityId: number,
    fieldName: string,
    oldValue: any,
    newValue: any,
    userId: number = 1
  ) {
    try {
      await db.insert(changeHistory).values({
        entityType,
        entityId,
        fieldName,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        userId,
      });
    } catch (error) {
      console.error('Error logging change:', error);
    }
  }

  // Отримання історії змін
  async getEntityHistory(entityType: string, entityId: number) {
    try {
      return await db
        .select()
        .from(changeHistory)
        .where(
          and(
            eq(changeHistory.entityType, entityType),
            eq(changeHistory.entityId, entityId)
          )
        )
        .orderBy(desc(changeHistory.timestamp));
    } catch (error) {
      console.error('Error getting entity history:', error);
      return [];
    }
  }

  // Порівняння версій
  generateDiff(oldValue: string | null, newValue: string | null) {
    try {
      const oldObj = oldValue ? JSON.parse(oldValue) : {};
      const newObj = newValue ? JSON.parse(newValue) : {};
      
      const changes: Array<{
        field: string;
        type: 'added' | 'modified' | 'deleted';
        oldValue?: any;
        newValue?: any;
      }> = [];

      // Знайти додані та змінені поля
      for (const key in newObj) {
        if (!(key in oldObj)) {
          changes.push({
            field: key,
            type: 'added',
            newValue: newObj[key]
          });
        } else if (oldObj[key] !== newObj[key]) {
          changes.push({
            field: key,
            type: 'modified',
            oldValue: oldObj[key],
            newValue: newObj[key]
          });
        }
      }

      // Знайти видалені поля
      for (const key in oldObj) {
        if (!(key in newObj)) {
          changes.push({
            field: key,
            type: 'deleted',
            oldValue: oldObj[key]
          });
        }
      }

      return changes;
    } catch (error) {
      console.error('Error generating diff:', error);
      return [];
    }
  }
}

export const historyService = new HistoryService();