import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostModel } from './model/post.model';
import { User, UserModel } from 'src/user/model/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostModel },
      { name: User.name, schema: UserModel },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
