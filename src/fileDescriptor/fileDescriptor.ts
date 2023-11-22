import { type FolderDescriptorImpl, type FileSystemDescriptor } from '.';
import { Writable, Readable } from 'stream';

export interface FileDescriptor extends FileSystemDescriptor {
  content: FileContent;
  copy: () => FileDescriptor;
}

/**
 * A file system descriptor that contains the content of a file. This must be a leaf node as it cannot hold any children.
 */
export class FileDescriptorImpl implements FileDescriptor {
  isFolder = false;

  name: string;
  parent: FolderDescriptorImpl;
  content: FileContentImpl;
  lastModified: Date;

  /**
   * @param name The filename of the file
   * @param parent The parent folder of the file
   */
  constructor(name: string, parent: FolderDescriptorImpl) {
    this.name = name;
    this.parent = parent;
    this.content = new FileContentImpl();
    this.lastModified = new Date();
  }

  get path(): string {
    return `${this.parent.path}${this.name}`;
  }

  get size(): number {
    return this.content.size;
  }

  copy(): FileDescriptor {
    const copy = new FileDescriptorImpl(this.name, this.parent);
    copy.content = this.content;
    copy.lastModified = this.lastModified;
    return copy;
  }
}

export interface FileContent {
  getWriteableStream: (append: boolean) => Writable;
  getReadableStream: () => Readable;
}

export class FileContentImpl implements FileContent {
  content: string;
  locked: boolean;

  constructor() {
    this.content = '';
    this.locked = false;
  }

  get size(): number {
    return this.content.length;
  }

  getWriteableStream(append?: boolean): Writable {
    if (append == null || !append) {
      this.content = '';
    }

    if (this.locked) {
      throw new Error('File is locked');
    }

    this.locked = true;

    const writable = new Writable({
      defaultEncoding: 'utf8',
      write: (chunk) => {
        this.content += chunk.toString();
      },
      final: (callback) => {
        this.locked = false;
        callback();
      },
    });

    return writable;
  }

  getReadableStream(): Readable {
    return Readable.from(this.content, { objectMode: false, encoding: 'utf8' });
  }
}
