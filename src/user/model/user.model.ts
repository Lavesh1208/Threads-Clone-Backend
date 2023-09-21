import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User & Document>;

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
export class User {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  profilePic: string;

  @Prop({})
  followers: string[];

  @Prop({})
  following: string[];

  @Prop({ default: '' })
  bio: string;
}

export const UserModel = SchemaFactory.createForClass(User);

UserModel.pre<User>('save', async function (next) {
  const user = this as UserDocument;

  if (user.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      user.password = hashedPassword;
      return next();
    } catch (error) {
      return next(error);
    }
  }
  return next();
});
