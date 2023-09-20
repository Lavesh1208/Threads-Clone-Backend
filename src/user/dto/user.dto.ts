import { Exclude, Expose } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  profilePic: string;

  @IsOptional()
  @IsArray()
  followers: string[];

  @IsOptional()
  @IsArray()
  following: string[];

  @IsOptional()
  @IsString()
  bio: string;
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  avatar: string;
}

export class ResponseUserDto {
  @Expose()
  _id?: mongoose.Types.ObjectId;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  profilePic: string;

  @Expose()
  followers: string[];

  @Expose()
  following: string[];

  @Expose()
  bio: string;

  @Expose()
  token: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;

  @Exclude()
  password: string;
}
