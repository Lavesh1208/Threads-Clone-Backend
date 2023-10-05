import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'SERVER HEALTH IS GOOD!';
  }
}
