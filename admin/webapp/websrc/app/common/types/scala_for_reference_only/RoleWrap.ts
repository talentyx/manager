// Generated by ScalaTS 0.5.9: https://scala-ts.github.io/scala-ts/

import { Role, isRole } from './Role';

export interface RoleWrap {
  config: Role;
}

export function isRoleWrap(v: any): v is RoleWrap {
  return (
    (v['config'] && isRole(v['config']))
  );
}