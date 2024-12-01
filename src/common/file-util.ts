import { is } from "./is";

export function addFileScheme(filePath: string) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  if (!is.windows()) {
    return normalizedPath.startsWith("theme:")
      ? normalizedPath
      : `theme://localhost/${normalizedPath}`;
  } else {
    return normalizedPath.startsWith("http")
      ? normalizedPath
      : `http://theme.localhost/${normalizedPath}`;
  }
}

export function addTailSlash(filePath: string) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return normalizedPath.endsWith("/")
    ? normalizedPath
    : normalizedPath + "/";
}