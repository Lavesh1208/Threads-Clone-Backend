import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './model/post.model';
import { Model } from 'mongoose';
import { CreatePostDto, ReplyToPostDto } from './dto/post.dto';
import { User } from 'src/user/model/user.model';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async createPost(createPostDto: CreatePostDto, currentUser: User) {
    const newPost = new this.postModel(createPostDto);
    newPost.postedBy = currentUser._id.toString();
    return await newPost.save();
  }

  async getPost(id: string) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found.');
    return post;
  }

  async deletePost(id: string, currentUser: User) {
    const post = await this.postModel.findById(id);

    if (!post) throw new NotFoundException('Post not found');

    if (post.postedBy.toString() !== currentUser._id.toString()) {
      throw new UnauthorizedException('You cannot delete this post');
    }

    await this.postModel.findByIdAndDelete(id);
    return 'Post deleted';
  }

  async likeUnLikePost(postId: string, currentUser: User) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found.');

    const userLikePost = post.likes.includes(currentUser._id.toString());
    if (userLikePost) {
      await this.postModel.updateOne(
        { _id: postId },
        {
          $pull: { likes: currentUser._id.toString() },
        },
      );

      return 'Post unliked successfully';
    } else {
      post.likes.push(currentUser._id.toString());
      post.save();

      return 'Post liked successfully';
    }
  }

  async replyToPost(
    postId: string,
    relpyToPostDto: ReplyToPostDto,
    currentUser: User,
  ) {
    const post = await this.postModel.findById(postId);

    if (!post) throw new NotFoundException('Post not found.');

    const reply = {
      userId: currentUser._id.toString(),
      text: relpyToPostDto.text,
      userProfilePic: currentUser.profilePic,
      username: currentUser.username,
    };

    post.replies.push(reply);

    await post.save();
    return { post, message: 'Reply added successfully' };
  }

  async getFeedPosts(currentUser: User) {
    const following = currentUser.following;
    const feedPosts = await this.postModel
      .find({
        postedBy: { $in: following },
      })
      .sort({ createdAt: -1 });

    return feedPosts;
  }
}
