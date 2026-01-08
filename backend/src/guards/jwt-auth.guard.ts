import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info?: any, context?: any, status?: any) {
    if (err || !user) {
      throw new UnauthorizedException('Yetkilendirme basarisiz.');
    }
    return user;
  }
}
