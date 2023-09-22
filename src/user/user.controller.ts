import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/utils/decorator/current-user.decorator';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { Serialize } from 'src/utils/interceptors/serialize.interceptor';
import {
  CreateUserDto,
  LoginUserDto,
  ResponseUserDto,
  UpdateUserDto,
} from './dto/user.dto';
import { User } from './model/user.model';
import { UserService } from './user.service';

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
  followUnFollow(@Param('id') id: string, @CurrentUser() user: User) {
    return this.userService.followUnFollow(id, user);
  }

  @UseGuards(AuthenticationGuard)
  @Put('/update/:id')
  updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    return this.userService.updateUser(id, updateUserDto, user);
  }

  @Serialize(ResponseUserDto)
  @Get('/profile/:username')
  findUserById(@Param('username') username: string) {
    return this.userService.findUserByUsername(username);
  }
}
