import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto, ResponseUserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { Serialize } from 'src/utils/interceptors/serialize.interceptor';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { Request } from 'express';
import { CurrentUser } from 'src/utils/decorator/current-user.decorator';
import { User } from './model/user.model';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Serialize(ResponseUserDto)
  @Post('signup')
  signupUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Serialize(ResponseUserDto)
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.userService.loginUser(loginUserDto);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/follow/:id')
  followUnFollow(@Param() { id }: { id: string }, @CurrentUser() user: User) {
    return this.userService.followUnFollow(id, user);
  }

  @Serialize(ResponseUserDto)
  @Get('/profile/:username')
  findUserById(@Param() { username }: { username: string }) {
    return this.userService.findUserByUsername(username);
  }
}
