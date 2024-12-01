import { is } from "./is";

export function addFileScheme(filePath: string) {
  if (!is.windows()) {
    return filePath.startsWith("theme:")
      ? filePath
      : `theme://localhost/${filePath}`;
  } else {
    return filePath.startsWith("http")
      ? filePath
      : `http://theme.localhost/${filePath}`;
  }
}

export function addTailSlash(filePath: string) {
  return filePath.endsWith("/") || filePath.endsWith("\\")
    ? filePath
    : filePath + "/";
}