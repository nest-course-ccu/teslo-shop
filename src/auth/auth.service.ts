import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}

  async findAll() {
    return await this.userRepository.find({});
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user);
      delete user.password
      return {
        ...user,
        token: this.getJwtToken({ 
          id: user.id 
        })
      };
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const { fullname } = updateUserDto;
      const user = await this.userRepository.findOneBy({
        id
      });
      console.log(user)
      await this.userRepository.save({
        ...user,
        fullname
      });
      return {
        ... await this.userRepository.findOneBy({ id }),
        token: this.getJwtToken({ 
          id 
        })
      };
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: {
        email
      },
      select: {
        email: true, password: true, id: true
      }
    })
    if(!user) {
      throw new UnauthorizedException('Credentials are not valid')
    }
    if(!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid')
    }
    const token = this.getJwtToken({ 
      id: user.id 
    });
    delete user.id;
    delete user.password;
    return {
      ...user,
      token 
    };
  }

  checkAuthStatus(user: User) {
    const { id, email, fullname } = user;
    const token = this.getJwtToken({
      id: user.id
    });
    return {
      id,
      email,
      fullname,
      token
    }
  }

  private handleDbErrors(error: any): never {
    console.log(error)
    if(error.code === '23505') {
      throw new BadRequestException(error.detail);
    } 
    throw new InternalServerErrorException('Check server logs')
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
