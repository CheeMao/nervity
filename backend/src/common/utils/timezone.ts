/**
 * 时区工具函数
 * 进程已通过 process.env.TZ = 'Asia/Shanghai' 设置为东八区
 * 以下函数基于系统时区，无需手动偏移
 */

/**
 * 获取当前北京时间
 * 由于进程 TZ 已设置为 Asia/Shanghai，new Date() 即为北京时间
 */
export function nowCN(): Date {
    return new Date();
}

/**
 * 获取北京时间的今日零点
 */
export function todayCN(): Date {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
}

/**
 * 将日期格式化为 YYYY-MM-DD（北京时间）
 * 由于 TZ 已设置，getFullYear/getMonth/getDate 返回北京时间的值
 */
export function formatDateCN(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
