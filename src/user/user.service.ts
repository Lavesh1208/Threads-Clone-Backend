import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import { sign } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/user.dto';
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

  async followUnFollow(id: string, currentUser: User) {
    const userToModify = await this.userModel.findById(id);

    if (!userToModify) throw new NotFoundException('User not found.');

    if (id === currentUser._id.toString())
      throw new NotAcceptableException('You cannot follow yourself.');

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      await this.userModel.findByIdAndUpdate(currentUser._id, {
        $pull: { following: id },
      });
      await this.userModel.findByIdAndUpdate(id, {
        $pull: { followers: currentUser._id },
      });

      return 'User unfollowed successfully';
    } else {
      await this.userModel.findByIdAndUpdate(currentUser._id, {
        $push: { following: id },
      });
      await this.userModel.findByIdAndUpdate(id, {
        $push: { followers: currentUser._id },
      });

      return 'User followed successfully';
    }
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ) {
    let user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (id !== currentUser._id.toString())
      throw new ForbiddenException('You cannot update this user');

    if (updateUserDto.profilePic) {
      if (updateUserDto.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split('/').pop().split('.')[0],
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(
        updateUserDto.profilePic,
      );
      updateUserDto.profilePic = uploadedResponse.secure_url;
    }

    user.name = updateUserDto.name || user.name;
    user.username = updateUserDto.username || user.username;
    user.email = updateUserDto.email || user.email;
    user.profilePic = updateUserDto.profilePic || user.profilePic;
    user.bio = updateUserDto.bio || user.bio;
    user.password = updateUserDto.password || user.password;

    user = await user.save();
    const token = await this.generateToken(user);
    return { ...user.toObject(), token };
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
