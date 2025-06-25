interface OllamaResponse {
  response: string;
  done: boolean;
}

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

const OLLAMA_BASE_URL = 'http://localhost:11434';
const MODEL_NAME = 'mistral';

async function callOllama(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
        }
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('OLLAMA_NOT_RUNNING');
      }
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response.trim();
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.message === 'OLLAMA_NOT_RUNNING') {
      throw new Error('OLLAMA_NOT_RUNNING');
    }
    throw error;
  }
}

function extractJsonFromResponse(response: string): any {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch (error) {
    console.warn('Failed to parse JSON from Ollama response:', response);
    return { fallback: true, content: response };
  }
}

export class AIService {
  async generateNames(request: NameGeneratorRequest): Promise<string[]> {
    try {
      const prompt = this.buildNamePrompt(request);
      const systemPrompt = "You are a fantasy name generator. Generate creative and authentic names that fit the requested theme and culture. Always respond with valid JSON in format: {\"names\": [\"name1\", \"name2\", ...]}";
      
      const response = await callOllama(prompt, systemPrompt);
      const result = extractJsonFromResponse(response);
      
      if (result.fallback) {
        const names = result.content.split('\n')
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) => line.replace(/^[-*•]\s*/, '').trim())
          .slice(0, request.count || 5);
        return names;
      }
      
      return result.names || [];
    } catch (error: any) {
      console.error('Error generating names:', error);
      if (error.message === 'OLLAMA_NOT_RUNNING') {
        throw new Error('OLLAMA_NOT_RUNNING');
      }
      throw new Error('Failed to generate names');
    }
  }

  async generateDescription(request: DescriptionGeneratorRequest): Promise<string> {
    try {
      const prompt = this.buildDescriptionPrompt(request);
      const systemPrompt = "You are a fantasy world builder. Create vivid, immersive descriptions that bring fantasy elements to life. Always respond with valid JSON in format: {\"description\": \"your description here\"}";
      
      const response = await callOllama(prompt, systemPrompt);
      const result = extractJsonFromResponse(response);
      
      if (result.fallback) {
        return result.content;
      }
      
      return result.description || '';
    } catch (error: any) {
      console.error('Error generating description:', error);
      if (error.message === 'OLLAMA_NOT_RUNNING') {
        throw new Error('OLLAMA_NOT_RUNNING');
      }
      throw new Error('Failed to generate description');
    }
  }

  async suggestConnections(worldData: any): Promise<ConnectionSuggestion[]> {
    try {
      const prompt = this.buildConnectionPrompt(worldData);
      const systemPrompt = "You are a fantasy world analyst. Analyze world elements and suggest meaningful connections that would enhance storytelling. Always respond with valid JSON in format: {\"connections\": [{\"type\": \"relationship\", \"entities\": [\"entity1\", \"entity2\"], \"description\": \"connection description\", \"strength\": 7}]}";
      
      const response = await callOllama(prompt, systemPrompt);
      const result = extractJsonFromResponse(response);
      
      if (result.fallback) {
        return [];
      }
      
      return result.connections || [];
    } catch (error: any) {
      console.error('Error suggesting connections:', error);
      if (error.message === 'OLLAMA_NOT_RUNNING') {
        throw new Error('OLLAMA_NOT_RUNNING');
      }
      throw new Error('Failed to suggest connections');
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
      const systemPrompt = "You are a fantasy historian. Generate compelling historical events that enrich fantasy worlds and provide story opportunities. Always respond with valid JSON.";
      const response = await callOllama(prompt, systemPrompt);
      const result = extractJsonFromResponse(response);
      
      if (result.fallback) {
        return [];
      }
      
      return result.events || [];
    } catch (error: any) {
      console.error('Error generating timeline events:', error);
      if (error.message === 'OLLAMA_NOT_RUNNING') {
        throw new Error('OLLAMA_NOT_RUNNING');
      }
      throw new Error('Failed to generate timeline events');
    }
  }

  private buildNamePrompt(request: NameGeneratorRequest): string {
    const { type, race, culture, theme, count = 5 } = request;
    
    let prompt = `Generate ${count} fantasy names for ${type}s.`;
    
    if (race) prompt += ` Race: ${race}.`;
    if (culture) prompt += ` Culture: ${culture}.`;
    if (theme) prompt += ` Theme: ${theme}.`;
    
    prompt += ` Return as JSON with "names" array.`;
    
    return prompt;
  }

  private buildDescriptionPrompt(request: DescriptionGeneratorRequest): string {
    const { name, type, context, style = 'detailed' } = request;
    
    let prompt = `Create a ${style} description for ${type} named "${name}".`;
    
    if (context) prompt += ` Context: ${context}.`;
    
    prompt += ` Return as JSON with "description" field.`;
    
    return prompt;
  }

  private buildConnectionPrompt(worldData: any): string {
    let prompt = `Analyze this fantasy world data and suggest meaningful connections between elements:

${JSON.stringify(worldData, null, 2)}

Suggest connections that would:
- Enhance storytelling potential
- Create interesting relationships
- Add depth to the world
- Provide adventure hooks

Return JSON with "connections" array containing type, entities, description, and strength (1-10).`;

    return prompt;
  }
}

export const aiService = new AIService();