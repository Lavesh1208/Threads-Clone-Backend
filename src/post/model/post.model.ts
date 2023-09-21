import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type PostDocument = HydratedDocument<Post & Document>;

@Schema({
  timestamps: true,
  id: false,
  toJSON: {
    virtuals: true,
    transform: function (doc: any, ret: any) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Post {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  postedBy: string;

  @Prop({ maxLength: 500 })
  text: string;

  @Prop({})
  img: string;

  @Prop({
    type: [Types.ObjectId],
    ref: 'User',
    default: [],
  })
  likes: string[];

  @Prop([
    {
      userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      userProfilePic: {
        type: String,
      },
      username: {
        type: String,
      },
    },
  ])
  replies: Record<string, any>[];
}

export const PostModel = SchemaFactory.createForClass(Post);
