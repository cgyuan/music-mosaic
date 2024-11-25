export function addFileScheme(filePath: string) {
  return filePath.startsWith("theme:")
    ? filePath
    : `theme://localhost/${filePath}`;
}

export function addTailSlash(filePath: string) {
  return filePath.endsWith("/") || filePath.endsWith("\\")
    ? filePath
    : filePath + "/";
}