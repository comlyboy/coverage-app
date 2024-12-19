import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! From Leke Omotayo... Powered by Lightspeed DMS team';
  }
}
