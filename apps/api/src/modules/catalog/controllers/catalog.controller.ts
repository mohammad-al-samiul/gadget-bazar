import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CatalogService } from '../services/catalog.service';
import { ProductFilterDto } from '../dto/product-filter.dto';
import { CompareQueryDto } from '../dto/compare-query.dto';

@ApiTags('Catalog')
@Controller({ version: '1', path: 'catalog' })
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get 2-level category tree (parents and subcategories)' })
  @ApiResponse({ status: 200, description: 'Category tree retrieved successfully' })
  async getCategories() {
    return this.catalogService.getCategories();
  }

  @Get('products')
  @ApiOperation({
    summary:
      'Public product listing with cursor pagination, category/price/stock filters and sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated public product list (confidential sourcing price redacted)',
  })
  async getProducts(@Query() filters: ProductFilterDto) {
    return this.catalogService.getProducts(filters);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Full-text search with bilingual analyzer (Bengali + English) and typo tolerance',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search term in Bengali or English' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default 20)' })
  @ApiResponse({ status: 200, description: 'Relevant product list' })
  async search(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.catalogService.searchProducts(query, limit ? Number(limit) : 20);
  }

  @Get('compare')
  @ApiOperation({
    summary: 'Compare 2 to 4 products across common specifications, weights, and price points',
  })
  @ApiResponse({
    status: 200,
    description: 'Structured comparison matrix with bilingual attribute rows',
  })
  async compare(@Query() query: CompareQueryDto) {
    const ids = query.ids
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    return this.catalogService.compareProducts(ids);
  }

  @Get('products/:idOrSku')
  @ApiOperation({ summary: 'Get single product details by UUID or SKU' })
  @ApiParam({ name: 'idOrSku', description: 'Product UUID or SKU code' })
  @ApiResponse({ status: 200, description: 'Product detail' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(@Param('idOrSku') idOrSku: string) {
    return this.catalogService.getProductByIdOrSku(idOrSku);
  }

  @Get('products/:id/bundle-suggestions')
  @ApiOperation({
    summary:
      'Get accessory and complementary product bundle suggestions with bundled discount pricing',
  })
  @ApiParam({ name: 'id', description: 'Primary Product UUID' })
  @ApiResponse({ status: 200, description: 'Bundle packages for the product' })
  async getBundleSuggestions(@Param('id') id: string) {
    return this.catalogService.getBundleSuggestions(id);
  }
}
