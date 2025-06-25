import { Random } from 'random-js';

export interface DnD5eStats {
  hp: number;
  ac: number;
  speed: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  cr: string;
  proficiency: number;
}

export interface CreatureAttack {
  name: string;
  attackBonus: number;
  damage: string;
  damageType: string;
  range: string;
  description?: string;
}

export interface EncounterCreature {
  name: string;
  cr: string;
  count: number;
  hp: number;
  ac: number;
}

export class RPGService {
  // 10.1 D&D 5e статблок генерація
  generateDnD5eStatblock(
    name: string,
    type: 'humanoid' | 'beast' | 'monstrosity' | 'undead' | 'fey' | 'dragon',
    level: number = 1
  ): DnD5eStats {
    const baseStats = this.getBaseStatsByType(type);
    const cr = this.calculateChallengeRating(level, type);
    const proficiency = this.getProficiencyBonus(cr);
    
    return {
      hp: this.calculateHP(baseStats.con, level, type),
      ac: this.calculateAC(baseStats.dex, type),
      speed: this.getSpeedByType(type),
      str: baseStats.str + Math.floor(level / 4),
      dex: baseStats.dex + Math.floor(level / 4),
      con: baseStats.con + Math.floor(level / 4),
      int: baseStats.int,
      wis: baseStats.wis,
      cha: baseStats.cha,
      cr: cr,
      proficiency: proficiency
    };
  }

  // Базові характеристики за типом створіння
  private getBaseStatsByType(type: string) {
    const stats = {
      humanoid: { str: 10, dex: 12, con: 11, int: 10, wis: 12, cha: 11 },
      beast: { str: 12, dex: 14, con: 12, int: 3, wis: 12, cha: 6 },
      monstrosity: { str: 14, dex: 12, con: 14, int: 6, wis: 12, cha: 8 },
      undead: { str: 11, dex: 14, con: 16, int: 6, wis: 10, cha: 12 },
      fey: { str: 8, dex: 16, con: 10, int: 14, wis: 15, cha: 16 },
      dragon: { str: 18, dex: 12, con: 16, int: 14, wis: 13, cha: 15 }
    };
    return stats[type as keyof typeof stats] || stats.humanoid;
  }

  private calculateHP(con: number, level: number, type: string): number {
    const conMod = Math.floor((con - 10) / 2);
    const hitDie = type === 'dragon' ? 12 : type === 'beast' ? 8 : 10;
    return Math.max(1, Math.floor(hitDie / 2 + 1) + conMod) * level;
  }

  private calculateAC(dex: number, type: string): number {
    const dexMod = Math.floor((dex - 10) / 2);
    const baseAC = type === 'dragon' ? 17 : type === 'beast' ? 12 : 13;
    return baseAC + (type === 'beast' ? dexMod : Math.max(0, dexMod));
  }

  private getSpeedByType(type: string): string {
    const speeds = {
      humanoid: "30 ft",
      beast: "40 ft",
      monstrosity: "30 ft",
      undead: "25 ft",
      fey: "35 ft, fly 60 ft",
      dragon: "40 ft, fly 80 ft"
    };
    return speeds[type as keyof typeof speeds] || "30 ft";
  }

  private calculateChallengeRating(level: number, type: string): string {
    const baseModifier = type === 'dragon' ? 2 : type === 'beast' ? -1 : 0;
    const adjustedLevel = Math.max(0, level + baseModifier);
    
    if (adjustedLevel < 1) return "1/8";
    if (adjustedLevel === 1) return "1/4";
    if (adjustedLevel === 2) return "1/2";
    if (adjustedLevel <= 4) return "1";
    if (adjustedLevel <= 8) return Math.floor(adjustedLevel / 2).toString();
    return Math.min(20, adjustedLevel - 2).toString();
  }

  private getProficiencyBonus(cr: string): number {
    const crNum = cr.includes('/') ? 0.5 : parseInt(cr);
    if (crNum < 1) return 2;
    if (crNum <= 4) return 2;
    if (crNum <= 8) return 3;
    if (crNum <= 12) return 4;
    if (crNum <= 16) return 5;
    return 6;
  }

  // 10.2 Encounter балансування
  calculateEncounterDifficulty(creatures: EncounterCreature[], partyLevel: number, partySize: number = 4): {
    totalXP: number;
    adjustedXP: number;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly';
  } {
    const totalXP = creatures.reduce((sum, creature) => {
      const crXP = this.getCRExperience(creature.cr);
      return sum + (crXP * creature.count);
    }, 0);

    const multiplier = this.getEncounterMultiplier(creatures.reduce((sum, c) => sum + c.count, 0));
    const adjustedXP = totalXP * multiplier;

    const thresholds = this.getExperienceThresholds(partyLevel, partySize);
    let difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly' = 'Easy';
    
    if (adjustedXP >= thresholds.deadly) difficulty = 'Deadly';
    else if (adjustedXP >= thresholds.hard) difficulty = 'Hard';
    else if (adjustedXP >= thresholds.medium) difficulty = 'Medium';

    return { totalXP, adjustedXP, difficulty };
  }

  private getCRExperience(cr: string): number {
    const xpTable: Record<string, number> = {
      "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
      "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800,
      "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900
    };
    return xpTable[cr] || 200;
  }

  private getEncounterMultiplier(creatureCount: number): number {
    if (creatureCount === 1) return 1;
    if (creatureCount === 2) return 1.5;
    if (creatureCount <= 6) return 2;
    if (creatureCount <= 10) return 2.5;
    return 3;
  }

  private getExperienceThresholds(level: number, partySize: number) {
    const baseThresholds = {
      1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
      2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
      3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
      4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
      5: { easy: 250, medium: 500, hard: 750, deadly: 1100 }
    };
    
    const threshold = baseThresholds[Math.min(level, 5) as keyof typeof baseThresholds] || baseThresholds[5];
    return {
      easy: threshold.easy * partySize,
      medium: threshold.medium * partySize,
      hard: threshold.hard * partySize,
      deadly: threshold.deadly * partySize
    };
  }

  // 10.3 Dice rolling система
  rollDice(formula: string, context?: string): {
    result: number;
    total: number;
    rolls: number[];
    formula: string;
    context?: string;
  } {
    try {
      const parsed = this.parseDiceFormula(formula);
      const random = new Random();
      const rolls: number[] = [];
      let total = 0;

      for (const part of parsed.parts) {
        if (part.type === 'dice') {
          for (let i = 0; i < (part.count || 1); i++) {
            const roll = random.integer(1, part.sides || 6);
            rolls.push(roll);
            total += roll;
          }
        } else if (part.type === 'modifier') {
          total += part.value || 0;
        }
      }

      return {
        result: total,
        total: total,
        rolls: rolls,
        formula: formula,
        context: context
      };
    } catch (error) {
      throw new Error(`Invalid dice formula: ${formula}`);
    }
  }

  private parseDiceFormula(formula: string): {
    parts: Array<{
      type: 'dice' | 'modifier';
      count?: number;
      sides?: number;
      value?: number;
    }>;
  } {
    const parts: any[] = [];
    
    // Простий парсер для формул типу "1d20+5", "3d6", "2d8-1"
    const cleanFormula = formula.replace(/\s/g, '').toLowerCase();
    
    // Знаходимо всі dice частини (XdY)
    const diceMatches = cleanFormula.match(/(\d+)d(\d+)/g);
    if (diceMatches) {
      diceMatches.forEach(match => {
        const [count, sides] = match.split('d').map(Number);
        parts.push({ type: 'dice', count, sides });
      });
    }

    // Знаходимо модифікатори (+X, -X)
    const modMatches = cleanFormula.match(/[+-]\d+/g);
    if (modMatches) {
      modMatches.forEach(match => {
        const value = parseInt(match);
        parts.push({ type: 'modifier', value });
      });
    }

    return { parts };
  }

  // 10.4 Treasure генерація
  generateTreasure(challengeRating: string, type: 'individual' | 'hoard' = 'individual'): {
    coins: { cp: number; sp: number; ep: number; gp: number; pp: number };
    items: string[];
    totalValue: number;
  } {
    const cr = challengeRating.includes('/') ? 0.5 : parseInt(challengeRating);
    
    let baseGold = 0;
    if (cr < 1) baseGold = Math.floor(Math.random() * 20) + 5;
    else if (cr <= 4) baseGold = Math.floor(Math.random() * 100) + 50;
    else if (cr <= 10) baseGold = Math.floor(Math.random() * 500) + 200;
    else baseGold = Math.floor(Math.random() * 1000) + 500;

    if (type === 'hoard') baseGold *= 3;

    const coins = this.distributeCoins(baseGold);
    const items = this.generateMagicItems(cr);
    const totalValue = baseGold + items.length * 50; // Примірна вартість предметів

    return { coins, items, totalValue };
  }

  private distributeCoins(totalValue: number) {
    // Розподіляємо золото між різними монетами
    const gp = Math.floor(totalValue * 0.6);
    const sp = Math.floor(totalValue * 0.3 * 10);
    const cp = Math.floor(totalValue * 0.1 * 100);
    
    return { cp, sp, ep: 0, gp, pp: 0 };
  }

  private generateMagicItems(cr: number): string[] {
    const items: string[] = [];
    const itemChance = Math.min(cr * 10, 80); // Більший CR = більше шансів на предмети
    
    if (Math.random() * 100 < itemChance) {
      const commonItems = [
        "Зілля лікування",
        "Сувій магічної стріли", 
        "Амулет природного обладунку",
        "Кільце захисту",
        "Плащ ельфійського типу"
      ];
      
      const rarItems = [
        "Меч +1",
        "Щит відображення",
        "Кристал істини",
        "Пояс гігантської сили",
        "Плащ невидимості"
      ];

      if (cr >= 5 && Math.random() < 0.3) {
        items.push(rarItems[Math.floor(Math.random() * rarItems.length)]);
      } else {
        items.push(commonItems[Math.floor(Math.random() * commonItems.length)]);
      }
    }

    return items;
  }
}

export const rpgService = new RPGService();