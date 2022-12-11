import { Controller, Post, Body, Get, UseGuards, Req, Headers, Param, Put, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http';
import { AuthService } from './auth.service';
import { Auth, GetUser, RawHeaders } from './decorators';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  findAll() {
    return this.authService.findAll();
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    await this.delay(10000);
    return await this.authService.create(createUserDto);
  }

  @Put('users/:id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.authService.update(id, updateUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto)
  }

  @Get('check-auth-status')
  @UseGuards(AuthGuard())
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders
  ) {
    return { message: 'Private data', 
      user, 
      userEmail,
      rawHeaders ,
      headers
    }
  }

  @Get('private2')
  @RoleProtected(ValidRoles.SuperUser)
  //@SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  testPrivate2Route(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders
  ) {
    return { message: 'Private data', 
      user, 
      userEmail,
      rawHeaders ,
      headers
    }
  }

  @Get('private3')
  @Auth(ValidRoles.Admin)
  testPrivate3Route(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders
  ) {
    return { message: 'Private data', 
      user, 
      userEmail,
      rawHeaders ,
      headers
    }
  }

}
