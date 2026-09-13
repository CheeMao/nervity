export function licenseStatus(user: { is_active: boolean; expire_time?: Date | string | null }, now = new Date()) {
  const expires = user.expire_time ? new Date(user.expire_time) : null;
  const validDate = expires !== null && Number.isFinite(expires.getTime());
  const valid = !!user.is_active && validDate && expires.getTime() > now.getTime();
  return {
    is_valid: valid,
    valid_message: !user.is_active ? "账号已被禁用" : !user.expire_time ? "未激活，请充值" :
      !validDate ? "授权信息无效" : !valid ? "授权已过期，请充值后继续使用" : "",
    expire_timestamp: validDate ? Math.floor(expires.getTime() / 1000) : null,
    remaining_seconds: valid ? Math.floor((expires.getTime() - now.getTime()) / 1000) : 0,
  };
}
