/**
 * Official Supermemory AI Cloud Client
 * 
 * Direct API integration with Supermemory AI (https://supermemory.ai)
 * Handles cloud vector memory storage, container tags, and semantic search.
 * 
 * @module brain/memory/supermemory-client
 */

export interface SupermemorySearchResult {
  id: string;
  content: string;
  score?: number;
  metadata?: Record<string, any>;
  containerTags?: string[];
  createdAt?: string;
}

export class SupermemoryClient {
  private apiKey: string | undefined;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.SUPERMEMORY_API_KEY;
    this.baseUrl = process.env.SUPERMEMORY_API_BASE_URL || 'https://api.supermemory.ai/v1';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Semantic vector search across Supermemory Cloud spaces
   */
  public async search(
    query: string,
    options: {
      containerTags?: string[];
      limit?: number;
    } = {}
  ): Promise<SupermemorySearchResult[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const res = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          q: query,
          containerTags: options.containerTags,
          limit: options.limit || 5,
        }),
      });

      if (!res.ok) {
        console.warn(`[supermemory-client] Cloud search returned ${res.status}: ${res.statusText}`);
        return [];
      }

      const data = await res.json();
      const results = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];

      return results.map((item: any) => ({
        id: item.id || `sm-${Math.random().toString(36).substring(2, 9)}`,
        content: item.content || item.text || item.chunk || '',
        score: item.score ?? item.relevance ?? 0.85,
        metadata: item.metadata || {},
        containerTags: item.containerTags || [],
        createdAt: item.createdAt,
      }));
    } catch (err) {
      console.warn('[supermemory-client] Network error during Supermemory cloud search:', err);
      return [];
    }
  }

  /**
   * Persist a durable fact into Supermemory Cloud
   */
  public async addMemory(
    content: string,
    options: {
      metadata?: Record<string, any>;
      containerTags?: string[];
    } = {}
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'SUPERMEMORY_API_KEY is not set in environment.' };
    }

    try {
      const res = await fetch(`${this.baseUrl}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          content,
          metadata: options.metadata || {},
          containerTags: options.containerTags || ['nexus_platform_shared'],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        return { success: false, error: `Supermemory API error ${res.status}: ${text}` };
      }

      const data = await res.json();
      return { success: true, id: data.id || data.memoryId };
    } catch (err: any) {
      return { success: false, error: err.message || 'Supermemory request failed' };
    }
  }
}

export const supermemoryClient = new SupermemoryClient();
