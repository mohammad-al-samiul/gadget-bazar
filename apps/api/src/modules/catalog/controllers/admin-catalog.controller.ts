import { Controller, Post, Patch, Delete, Param, Body, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AdminCatalogService } from '../services/admin-catalog.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import { Audit } from '../../../common/decorators/audit.decorator';

@ApiTags('Admin Catalog')
@Controller({ version: '1', path: 'admin/catalog' })
@UseInterceptors(AuditLogInterceptor)
export class AdminCatalogController {
  constructor(private readonly adminCatalogService: AdminCatalogService) {}

  @Post('products')
  @Audit('Product')
  @ApiOperation({ summary: 'Create new product with variants and media' })
  @ApiResponse({ status: 201, description: 'Product successfully created and queued for indexing' })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.adminCatalogService.createProduct(dto);
  }

  @Patch('products/:id')
  @Audit('Product')
  @ApiOperation({ summary: 'Update product details, pricing, and specs' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product updated and re-indexed' })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminCatalogService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @Audit('Product')
  @ApiOperation({ summary: 'Soft-delete product and remove from search index' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product soft deleted' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminCatalogService.deleteProduct(id);
  }

  @Post('categories')
  @Audit('Category')
  @ApiOperation({ summary: 'Create a primary or 2nd-level subcategory' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminCatalogService.createCategory(dto);
  }

  @Patch('categories/:id')
  @Audit('Category')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async updateCategory(@Param('id') id: string, @Body() dto: Partial<CreateCategoryDto>) {
    return this.adminCatalogService.updateCategory(id, dto);
  }

  @Post('reindex')
  @Audit('Product')
  @ApiOperation({ summary: 'Trigger complete catalog sync & Elasticsearch reindexing' })
  @ApiResponse({ status: 200, description: 'All active products indexed' })
  async reindex() {
    return this.adminCatalogService.fullReindex();
  }
}
