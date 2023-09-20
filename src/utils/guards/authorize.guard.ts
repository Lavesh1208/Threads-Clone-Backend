import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';

export const AdminGuard = () => {
  class AdminGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const result: boolean = request?.user?.admin;
      console.log('is Admin', result);
      if (!result) {
        throw new UnauthorizedException('Sorry, you are not authorized');
      }
      return true;
    }
  }

  const guard = mixin(AdminGuardMixin);
  return guard;
};
