import { type Folder } from "./folder";

export interface File {
  path: string;
  parent: Folder;
  content: string;
}