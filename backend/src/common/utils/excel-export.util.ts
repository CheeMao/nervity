import ExcelJS from "exceljs";

export class ExcelExportUtil {
  /**
   * 将数据导出为 Excel 文件
   * @param data 数据数组
   * @param filename 文件名（不含扩展名）
   * @returns Buffer
   */
  static async exportToBuffer(data: Record<string, any>[], filename: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    const headers = data.length ? Object.keys(data[0]) : [];
    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: this.calculateColumnWidths(data)[headers.indexOf(header)]?.wch || 12,
    }));
    for (const row of data) {
      const safeRow: Record<string, any> = {};
      for (const header of headers) {
        const value = row[header];
        safeRow[header] = typeof value === "string" && /^[=+\-@]/.test(value) ? `'${value}` : value;
      }
      worksheet.addRow(safeRow);
    }
    worksheet.getRow(1).font = { bold: true };
    const output = await workbook.xlsx.writeBuffer();
    return Buffer.from(output);
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
