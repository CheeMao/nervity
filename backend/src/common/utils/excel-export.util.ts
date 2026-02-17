import * as XLSX from "xlsx";

export class ExcelExportUtil {
  /**
   * 将数据导出为 Excel 文件
   * @param data 数据数组
   * @param filename 文件名（不含扩展名）
   * @returns Buffer
   */
  static exportToBuffer(data: Record<string, any>[], filename: string): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 设置列宽
    const colWidths = this.calculateColumnWidths(data);
    worksheet["!cols"] = colWidths;

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  }

  /**
   * 计算列宽
   */
  private static calculateColumnWidths(data: Record<string, any>[]): { wch: number }[] {
    if (!data || data.length === 0) return [];

    const headers = Object.keys(data[0]);
    return headers.map((header) => {
      // 计算标题宽度和数据最大宽度
      let maxWidth = header.length;
      for (const row of data) {
        const cellValue = String(row[header] || "");
        maxWidth = Math.max(maxWidth, cellValue.length);
      }
      return { wch: Math.min(maxWidth + 2, 50) }; // 最大 50
    });
  }

  /**
   * 格式化日期
   */
  static formatDate(date: Date | string | null): string {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
}
