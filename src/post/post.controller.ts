import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/user/model/user.model';
import { CurrentUser } from 'src/utils/decorator/current-user.decorator';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { CreatePostDto, ReplyToPostDto } from './dto/post.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthenticationGuard)
  @Get('/feed')
  getFeedPosts(@CurrentUser() currentUser: User) {
    return this.postService.getFeedPosts(currentUser);
  }

  @Get('/user/:username')
  getUserPosts(@Param('username') username: string) {
    return this.postService.getUserPosts(username);
  }

  @Get('/:id')
  getPost(@Param('id') id: string) {
    return this.postService.getPost(id);
  }

  @UseGuards(AuthenticationGuard)
  @Post('create')
  createPost(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.postService.createPost(createPostDto, currentUser);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/:id')
  deletePost(@Param('id') postId: string, @CurrentUser() currentUser: User) {
    return this.postService.deletePost(postId, currentUser);
  }

  @UseGuards(AuthenticationGuard)
  @Put('like/:id')
  likeUnLikePost(
    @Param('id') postId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.postService.likeUnLikePost(postId, currentUser);
  }

  @UseGuards(AuthenticationGuard)
  @Post('reply/:id')
  replyToPost(
    @Param('id') postId: string,
    @Body() relpyToPostDto: ReplyToPostDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.postService.replyToPost(postId, relpyToPostDto, currentUser);
  }
}
