import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
  ) {

  }

  async runSeed() {
    await this.productService.deleteAllProducts();
    await this.insertNewProducts();
    return { message: 'Seed executed' }
  }

  private async insertNewProducts() {
    const products = initialData.products;
    const inserPromises = [];
    products.forEach(product => {
      inserPromises.push(this.productService.create(product));
    })
    await Promise.all(inserPromises);
    return true;
  }

}
