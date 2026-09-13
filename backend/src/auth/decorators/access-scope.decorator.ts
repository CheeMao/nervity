import { SetMetadata } from "@nestjs/common";

export const ACCESS_SCOPE = "netverify:access-scope";
export const Public = () => SetMetadata(ACCESS_SCOPE, "public");
export const ClientOnly = () => SetMetadata(ACCESS_SCOPE, "client");

export const MANAGED_RESOURCE = "netverify:managed-resource";
export const ManagedResource = (resource: string) => SetMetadata(MANAGED_RESOURCE, resource);
