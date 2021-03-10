/* eslint-disable class-methods-use-this */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
require('dotenv').config();

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const token = context
      .switchToHttp()
      .getRequest()
      .headers?.authorization?.replace('Bearer ', '');
    // If the token does not exist or does not match that of env return false
    return !(!token || token !== process.env.TOKEN);
  }
}
