import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  text: string;

  @IsOptional()
  @IsString()
  img: string;

  @IsOptional()
  @IsString()
  likes: string;

  @IsOptional()
  @IsString()
  replies: string;
}

export class ReplyToPostDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}
