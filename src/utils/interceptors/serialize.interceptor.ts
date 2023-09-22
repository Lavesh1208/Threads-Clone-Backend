import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Types } from 'mongoose';
import { Observable, map } from 'rxjs';

export function Serialize(dto: any) {
  return UseInterceptors(new SeriallizeInterceptor(dto));
}

export class SeriallizeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        if (data._id instanceof Types.ObjectId) {
          data._id = data._id.toHexString();
        }
        const response = plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
        return response;
      }),
    );
  }
}
