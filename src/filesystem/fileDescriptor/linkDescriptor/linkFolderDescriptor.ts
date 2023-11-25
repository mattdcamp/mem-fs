import { type SoftLinkDescriptor, type HardLinkDescriptor, type LinkDescriptor } from '.';
import { type FileDescriptor, type FileSystemDescriptor, type FolderDescriptor } from '..';
import { PATH_SEPARATOR } from '../../constants';
import { resolvePath } from '../../pathResolvers';

export abstract class LinkFolderDescriptor implements FolderDescriptor, LinkDescriptor {
  readonly isFolder = true;
  readonly isLink = true;

  name: string;
  parent: FolderDescriptor | null;

  abstract readonly link: FolderDescriptor;
  abstract readonly isHardLink: boolean;

  constructor(name?: string | null, parent?: FolderDescriptor | null) {
    this.name = name ?? '';
    this.parent = parent ?? null;
  }

  get children(): FileSystemDescriptor[] {
    return this.link.children;
  }

  get folders(): FolderDescriptor[] {
    return this.link.folders;
  }

  get files(): FileDescriptor[] {
    return this.link.files;
  }

  get size(): number {
    return this.link.size;
  }

  get path(): string {
    if (this.parent === null) {
      return PATH_SEPARATOR;
    } else {
      return `${this.parent.path}${this.name}${PATH_SEPARATOR}`;
    }
  }

  get lastModified(): Date {
    return this.link.lastModified;
  }

  searchChildren(name: string): FileSystemDescriptor[] {
    return this.link.searchChildren(name);
  }

  findChild(name: string): FileSystemDescriptor | null {
    return this.link.findChild(name);
  }

  addContent(content: FileSystemDescriptor): void {
    this.link.addContent(content);
  }

  removeContent(name: string): void {
    this.link.removeContent(name);
  }

  abstract copy(): FolderDescriptor;
}

/**
 * Constructs a new hard link folder descriptor
 *
 * @param link The Folder to link to
 * @param name The name of the link
 * @param parent The parent folder that this link will reside in
 * @returns a new HardLinkFolderDescriptor
 */
export function buildFolderHardLink(
  link: FolderDescriptor,
  name: string,
  parent: FolderDescriptor | null,
): LinkFolderDescriptor {
  return new HardLinkFolderDescriptorImpl(link, name, parent);
}

/**
 * The default implementation of a hard link descriptor for Folders. Implements the link property as a hard link to the
 * FileDescriptor. This will allow the link to persist, even it the original folder is deleted or moved.
 */
export class HardLinkFolderDescriptorImpl extends LinkFolderDescriptor implements HardLinkDescriptor, FolderDescriptor {
  readonly isHardLink = true;
  link: FolderDescriptor;

  constructor(link: FolderDescriptor, name: string, parent: FolderDescriptor | null) {
    super(name, parent);
    this.link = link;
  }

  copy(): FolderDescriptor {
    return new HardLinkFolderDescriptorImpl(this.link, this.name, null);
  }
}

/**
 * Constructs a new soft link folder descriptor
 *
 * @param link The Folder to link to
 * @param name The name of the link
 * @param parent The parent folder that this link will reside in
 * @param rootFolder The root folder of the filesystem
 * @returns a new SoftLinkFolderDescriptor
 */
export function buildFolderSoftLink(
  link: FolderDescriptor,
  name: string,
  parent: FolderDescriptor | null,
  rootFolder: FolderDescriptor,
): LinkFolderDescriptor {
  return new SoftLinkFolderDescriptorImpl(link, name, parent, rootFolder);
}

/**
 * The default implementation of a soft link descriptor for Folders. Implements the link property as an absolute path
 * which is resolved each time the link is used. This means if the original folder is deleted or moved, the link will stop
 * working.
 */
export class SoftLinkFolderDescriptorImpl extends LinkFolderDescriptor implements SoftLinkDescriptor, FolderDescriptor {
  readonly isHardLink = false;
  linkAbsolutePath: string;
  rootFolder: FolderDescriptor;

  constructor(
    linkFolder: FolderDescriptor,
    name: string,
    parent: FolderDescriptor | null,
    rootFolder: FolderDescriptor,
  ) {
    super(name, parent);
    this.linkAbsolutePath = linkFolder.path;
    this.rootFolder = rootFolder;
  }

  get link(): FolderDescriptor {
    let resolved: FileSystemDescriptor[] | null = null;
    try {
      resolved = resolvePath(this.linkAbsolutePath, this.rootFolder, this.rootFolder);
    } catch (e) {
      if (e instanceof Error) {
        resolved = null;
      } else {
        throw e;
      }
    }

    if (resolved === null || resolved.length === 0) {
      throw new Error(`Could not resolve link ${this.linkAbsolutePath} at path ${this.path}`);
    }

    if (resolved.length > 1) {
      throw new Error(`Link ${this.linkAbsolutePath} at path ${this.path} points to multiple files`);
    }

    if (!resolved[0].isFolder) {
      throw new Error(`Link ${this.linkAbsolutePath} at path ${this.path} points to a file, expected folder`);
    }

    return resolved[0] as FolderDescriptor;
  }

  copy(): FolderDescriptor {
    return new SoftLinkFolderDescriptorImpl(this.link, this.name, null, this.rootFolder);
  }
}
