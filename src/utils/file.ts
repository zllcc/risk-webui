/**
 * blob 文件下载
 */
export function saveBlobFile(url: Blob, fileName: string) {
  console.log(url, '=====url')
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}