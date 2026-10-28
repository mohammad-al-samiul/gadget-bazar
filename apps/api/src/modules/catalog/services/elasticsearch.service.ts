import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '../../config/config.service';

export interface ElasticsearchSearchResult {
  productIds: string[];
  total: number;
}

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client!: Client;
  private isAvailable = false;
  private readonly indexName = 'gadgetbazar_products';

  constructor(private readonly config: ConfigService) {
    const nodeUrl = this.config.get('ELASTICSEARCH_NODE') || 'http://localhost:9200';
    this.client = new Client({
      node: nodeUrl,
      requestTimeout: 2000, // fast fail for degraded mode
      maxRetries: 1,
    });
  }

  async onModuleInit() {
    try {
      await this.client.ping();
      this.isAvailable = true;
      this.logger.log('Elasticsearch connection established successfully.');
      await this.ensureIndexExists();
    } catch (err) {
      this.isAvailable = false;
      this.logger.warn(
        `Elasticsearch unavailable at startup (${(err as Error).message}). Search will operate in degraded DB fallback mode.`,
      );
    }
  }

  async ensureIndexExists(): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      if (!exists) {
        await (this.client.indices.create as any)({
          index: this.indexName,
          settings: {
            analysis: {
              analyzer: {
                bengali_english_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'decimal_digit'],
                },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              sku: { type: 'keyword' },
              titleBn: {
                type: 'text',
                analyzer: 'bengali_english_analyzer',
                fields: { keyword: { type: 'keyword' } },
              },
              titleEn: {
                type: 'text',
                analyzer: 'standard',
                fields: { keyword: { type: 'keyword' } },
              },
              descriptionBn: { type: 'text', analyzer: 'bengali_english_analyzer' },
              descriptionEn: { type: 'text', analyzer: 'standard' },
              retailPriceBdt: { type: 'double' },
              categoryId: { type: 'keyword' },
              isActive: { type: 'boolean' },
            },
          },
        });
        this.logger.log(`Created Elasticsearch index: ${this.indexName}`);
      }
    } catch (err) {
      this.logger.warn(
        `Could not verify/create index ${this.indexName}: ${(err as Error).message}`,
      );
    }
  }

  async indexProduct(product: {
    id: string;
    sku: string;
    titleBn: string;
    titleEn: string;
    descriptionBn?: string | null;
    descriptionEn?: string | null;
    retailPriceBdt: number | string | any;
    categoryId: string;
    isActive: boolean;
  }): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }

    try {
      await (this.client.index as any)({
        index: this.indexName,
        id: product.id,
        document: {
          id: product.id,
          sku: product.sku,
          titleBn: product.titleBn,
          titleEn: product.titleEn,
          descriptionBn: product.descriptionBn,
          descriptionEn: product.descriptionEn,
          retailPriceBdt: Number(product.retailPriceBdt),
          categoryId: product.categoryId,
          isActive: product.isActive,
        },
      });
      return true;
    } catch (err) {
      this.logger.warn(`Failed to index product ${product.id}: ${(err as Error).message}`);
      return false;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }

    try {
      await this.client.delete({
        index: this.indexName,
        id: productId,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Search query using multi-match across Bengali and English fields with typo tolerance.
   * Returns null if Elasticsearch is offline or times out (triggering DB fallback).
   */
  async search(queryText: string, limit = 20): Promise<ElasticsearchSearchResult | null> {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const response: any = await (this.client.search as any)({
        index: this.indexName,
        size: limit,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: queryText,
                  fields: ['titleBn^3', 'titleEn^3', 'sku^2', 'descriptionBn', 'descriptionEn'],
                  fuzziness: 'AUTO',
                  prefix_length: 2,
                },
              },
              {
                term: { isActive: true },
              },
            ],
          },
        },
      });

      const hits = response.hits?.hits || [];
      const productIds = hits.map((hit: any) => hit._id);
      const total =
        typeof response.hits?.total === 'number'
          ? response.hits.total
          : response.hits?.total?.value || productIds.length;

      return { productIds, total };
    } catch (err) {
      this.logger.warn(
        `Elasticsearch query failed (${(err as Error).message}). Falling back to DB search.`,
      );
      return null; // Signals degraded mode fallback
    }
  }
}
