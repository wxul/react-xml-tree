/**
 * 构造下载文件
 * @param fileName
 * @param content
 */
export function download(fileName: string, content: string) {
  const link = document.createElement('a');
  const blob = new Blob([content]);
  link.download = fileName;
  link.href = URL.createObjectURL(blob);
  link.click();
}
