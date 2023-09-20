import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotAcceptableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import { sign } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import { User, UserDocument } from './model/user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const userExists = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (userExists) throw new ConflictException('User already exists.');

    const user = await this.userModel.create(createUserDto);
    const token = await this.generateToken(user);

    return { ...user.toObject(), token };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.userModel.findOne({
      username: loginUserDto.username,
    });

    if (!user) throw new ConflictException('Invalid Credentials.');

    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);

    if (!isMatch) throw new ConflictException('Invalid Credentials.');

    const token = await this.generateToken(user);

    return { ...user.toObject(), token };
  }

  async followUnFollow(id: string, req: Request) {
    const userToModify = await this.userModel.findById(id);

    if (!userToModify) throw new NotFoundException('User not found.');

    const currentUser = req.user;

    if (id === currentUser._id.toString())
      throw new NotAcceptableException('You cannot follow yourself.');

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      await this.userModel.findByIdAndUpdate(req.user._id, {
        $pull: { following: id },
      });
      await this.userModel.findByIdAndUpdate(id, {
        $pull: { followers: req.user._id },
      });
    } else {
      await this.userModel.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });
      await this.userModel.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
    }
  }

  async findUserByUsername(username: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async findUserById(_id: string): Promise<User> {
    return this.userModel.findById(_id);
  }

  private generateToken(user: User) {
    return sign(
      {
        _id: user._id,
        email: user.email,
      },
      this.configService.get('JWT_SECRET'),
      { expiresIn: this.configService.get('TOKEN_EXPIRE_TIME') },
    );
  }
}
