import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { decode } from 'jsonwebtoken';
import { User } from 'src/user/model/user.model';
import { UserService } from 'src/user/user.service';

declare module 'express' {
  interface Request {
    user?: User;
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req?.headers?.authorization?.split('Bearer ')[1];
      const { _id } = <JwtPayload>await decode(token);
      const user = await this.userService.findUserById(_id);
      req.user = user;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  }
}

interface JwtPayload {
  _id: string;
}
