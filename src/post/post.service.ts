import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/model/user.model';
import { CreatePostDto, ReplyToPostDto } from './dto/post.dto';
import { Post, PostDocument } from './model/post.model';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createPost(createPostDto: CreatePostDto, currentUser: User) {
    if (createPostDto.img) {
      const uploadedResponse = await cloudinary.uploader.upload(
        createPostDto.img,
      );
      createPostDto.img = uploadedResponse.secure_url;
    }
    const newPost = new this.postModel(createPostDto);
    newPost.postedBy = currentUser._id.toString();
    return await newPost.save();
  }

  async getPost(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate(['postedBy', 'replies']);
    if (!post) throw new NotFoundException('Post not found.');
    return post;
  }

  async deletePost(id: string, currentUser: User) {
    const post = await this.postModel.findById(id);

    if (!post) throw new NotFoundException('Post not found');

    if (post.postedBy.toString() !== currentUser._id.toString()) {
      throw new UnauthorizedException('You cannot delete this post');
    }

    if (post.img && post.img > '') {
      const public_id = post.img.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(public_id);
    }

    await this.postModel.findByIdAndDelete(id);
    return { message: 'Post deleted' };
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

      return { message: 'Post unliked successfully', isLiked: false };
    } else {
      post.likes.push(currentUser._id.toString());
      post.save();

      return { message: 'Post liked successfully', isLiked: true };
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
      .sort({ createdAt: -1 })
      .populate(['postedBy', 'replies']);
    return feedPosts;
  }

  async getUserPosts(username: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) throw new NotFoundException('User not found.');

    const posts = await this.postModel
      .find({ postedBy: user._id.toHexString() })
      .sort({ createdAt: -1 })
      .populate(['postedBy', 'replies']);

    return posts;
  }
}
