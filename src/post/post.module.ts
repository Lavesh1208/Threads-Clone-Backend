import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostModel } from './model/post.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostModel }]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
