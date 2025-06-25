import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface NameGeneratorRequest {
  type: 'character' | 'location' | 'artifact' | 'organization';
  race?: string;
  culture?: string;
  theme?: string;
  count?: number;
}

export interface DescriptionGeneratorRequest {
  name: string;
  type: 'character' | 'location' | 'artifact' | 'creature' | 'event';
  context?: string;
  style?: 'brief' | 'detailed' | 'poetic';
}

export interface ConnectionSuggestion {
  type: 'relationship' | 'event' | 'location_connection';
  entities: string[];
  description: string;
  strength: number; // 1-10
}

export class AIService {
  async generateNames(request: NameGeneratorRequest): Promise<string[]> {
    const prompt = this.buildNamePrompt(request);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a fantasy name generator. Generate authentic, immersive fantasy names that fit the requested criteria. Respond with JSON format: { \"names\": [\"name1\", \"name2\", ...] }"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"names":[]}');
      return result.names || [];
    } catch (error) {
      console.error('AI name generation error:', error);
      throw new Error('Failed to generate names');
    }
  }

  async generateDescription(request: DescriptionGeneratorRequest): Promise<string> {
    const prompt = this.buildDescriptionPrompt(request);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a fantasy world building assistant. Create immersive, detailed descriptions that enhance the fantasy world. Write in a style that fits tabletop RPGs and fantasy literature."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('AI description generation error:', error);
      throw new Error('Failed to generate description');
    }
  }

  async suggestConnections(worldData: any): Promise<ConnectionSuggestion[]> {
    const prompt = this.buildConnectionPrompt(worldData);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a world building analyst. Analyze fantasy world elements and suggest meaningful connections, relationships, and story hooks. Respond with JSON format: { \"connections\": [{\"type\": \"relationship\", \"entities\": [\"entity1\", \"entity2\"], \"description\": \"connection description\", \"strength\": 5}] }"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"connections":[]}');
      return result.connections || [];
    } catch (error) {
      console.error('AI connection analysis error:', error);
      throw new Error('Failed to analyze connections');
    }
  }

  async generateTimelineEvents(worldContext: string, timelineName: string, count: number = 5): Promise<any[]> {
    const prompt = `Generate ${count} historical events for a fantasy timeline called "${timelineName}" in this world context:

${worldContext}

Create events that:
- Build upon existing world elements
- Create interesting historical depth
- Provide hooks for current stories
- Have appropriate dates and importance levels (1-5)

Return JSON: { "events": [{"name": "Event Name", "description": "Event description", "date": "Year/Era", "importance": 3, "type": "war|discovery|founding|disaster|political"}] }`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a fantasy historian. Generate compelling historical events that enrich fantasy worlds and provide story opportunities."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"events":[]}');
      return result.events || [];
    } catch (error) {
      console.error('AI timeline generation error:', error);
      throw new Error('Failed to generate timeline events');
    }
  }

  private buildNamePrompt(request: NameGeneratorRequest): string {
    let prompt = `Generate ${request.count || 5} fantasy ${request.type} names`;
    
    if (request.race) prompt += ` for ${request.race} race`;
    if (request.culture) prompt += ` with ${request.culture} cultural influences`;
    if (request.theme) prompt += ` with ${request.theme} theme`;
    
    switch (request.type) {
      case 'character':
        prompt += '. Names should sound authentic and memorable for fantasy RPG characters.';
        break;
      case 'location':
        prompt += '. Names should evoke the feeling of mysterious, ancient or majestic places.';
        break;
      case 'artifact':
        prompt += '. Names should sound powerful, ancient, and hint at magical properties.';
        break;
      case 'organization':
        prompt += '. Names should convey purpose, authority, or mystique appropriate for fantasy guilds/orders.';
        break;
    }
    
    return prompt;
  }

  private buildDescriptionPrompt(request: DescriptionGeneratorRequest): string {
    let prompt = `Create a ${request.style || 'detailed'} description for the ${request.type} named "${request.name}"`;
    
    if (request.context) {
      prompt += ` in the context of: ${request.context}`;
    }
    
    switch (request.type) {
      case 'character':
        prompt += '. Include appearance, personality traits, background, and motivations.';
        break;
      case 'location':
        prompt += '. Include geography, atmosphere, notable features, and what makes it special.';
        break;
      case 'artifact':
        prompt += '. Include appearance, magical properties, history, and significance.';
        break;
      case 'creature':
        prompt += '. Include appearance, behavior, habitat, and abilities.';
        break;
      case 'event':
        prompt += '. Include what happened, key figures involved, and lasting consequences.';
        break;
    }
    
    prompt += ' Write in an engaging, immersive style suitable for fantasy world building.';
    return prompt;
  }

  private buildConnectionPrompt(worldData: any): string {
    const characters = worldData.characters?.map((c: any) => c.name?.uk || c.name?.en || c.name) || [];
    const locations = worldData.locations?.map((l: any) => l.name?.uk || l.name?.en || l.name) || [];
    const organizations = worldData.organizations || [];
    
    return `Analyze this fantasy world and suggest meaningful connections:

Characters: ${characters.slice(0, 10).join(', ')}
Locations: ${locations.slice(0, 10).join(', ')}
Organizations: ${organizations.slice(0, 5).join(', ')}

Suggest 3-5 interesting connections such as:
- Character relationships (allies, rivals, family)
- Historical events connecting characters and locations
- Hidden connections that create story opportunities
- Political or economic relationships

Focus on connections that would enhance storytelling and world depth.`;
  }
}

export const aiService = new AIService();