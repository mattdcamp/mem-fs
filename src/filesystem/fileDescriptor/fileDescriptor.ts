import { type FileSystemDescriptor, type FolderDescriptor } from '.';
import { Writable, Readable } from 'stream';

/**
 * A content node of the file system.
 */
export interface FileDescriptor extends FileSystemDescriptor {
  /**
   * Retrieve a stream that can be used to write content to this node. See
   * https://nodejs.org/api/stream.html#stream_writable_streams for deailts on how to use a Writeable stream.
   * 
   * @param append If true, the content will be appended to the existing content. If false, the content will be
   * overwritten.
   * @returns A Writeable stream that can be used to write content to this node.
   */
  getWriteableStream: (append: boolean) => Writable;

  /**
   * Retrieve a stream that can be used to read content from this node. See 
   * https://nodejs.org/api/stream.html#stream_readable_streams for details on how to use a Readable stream.
   * 
   * @returns A Readable stream that can be used to read content from this node.
   */
  getReadableStream: () => Readable;

  copy: () => FileDescriptor;
}

/**
 * Create a new file descriptor with the given name and parent.
 * 
 * @param name The name of the file
 * @param parent The folder the file will reside in
 * @returns A new FileDescriptor
 */
export function buildFileDescriptor(name: string, parent: FolderDescriptor): FileDescriptor {
  return new FileDescriptorImpl(name, parent);
}

/**
 * A file system descriptor that contains the content of a file. This must be a leaf node as it cannot hold any children.
 */
export class FileDescriptorImpl implements FileDescriptor {
  isFolder = false;
  isLink = false;

  name: string;
  parent: FolderDescriptor;
  content: FileContentImpl;
  lastModified: Date;

  /**
   * @param name The filename of the file
   * @param parent The parent folder of the file
   */
  constructor(name: string, parent: FolderDescriptor) {
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

  getWriteableStream(append?: boolean): Writable {
    return this.content.getWriteableStream(append);
  }

  getReadableStream(): Readable {
    return this.content.getReadableStream();
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
      write: (chunk, encoding, callback) => {
        this.content += chunk.toString();
        callback();
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
