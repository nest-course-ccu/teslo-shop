import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {

  }

  async runSeed() {
    await this.deleteData();
    const admin = await this.insertNewUsers();

    await this.productService.deleteAllProducts();
    await this.insertNewProducts(admin);
    return { message: 'Seed executed' }
  }

  private async deleteData() {
    await this.productService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();
  }

  private async insertNewProducts(user: User) {
    const products = initialData.products;
    const inserPromises = [];
    products.forEach(product => {
      inserPromises.push(this.productService.create(product, user));
    })
    await Promise.all(inserPromises);
    return true;
  }

  private async insertNewUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach(seedUser => {
      users.push(this.userRepository.create({
        ...seedUser,
        password: bcrypt.hashSync(seedUser.password, 10)
      }))
    });

    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];
  }

}
