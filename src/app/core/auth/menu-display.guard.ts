export interface MenuDisplayContext {
  isAuthenticated: boolean;
  isAdmin: boolean;
  roles: string[];
}

export type MenuDisplayGuard = (context: MenuDisplayContext) => boolean;

export const authenticatedGuard = (): MenuDisplayGuard => {
  return (context) => context.isAuthenticated;
};

export const adminGuard = (): MenuDisplayGuard => {
  return (context) => context.isAdmin;
};

export const roleGuard = (requiredRoles: string[]): MenuDisplayGuard => {
  return (context) =>
    requiredRoles.some((requiredRole) => context.roles.includes(requiredRole));
};