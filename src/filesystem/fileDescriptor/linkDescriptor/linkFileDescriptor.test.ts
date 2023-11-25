import { type FileDescriptor, type FolderDescriptor } from '..';
import { FileDescriptorImpl } from '../fileDescriptor';
import { FolderDescriptorImpl } from '../folderDescriptor';
import { HardLinkFileDescriptorImpl, SoftLinkFileDescriptorImpl } from './linkFileDescriptor';

describe('linkFileDescriptor', () => {
  let rootFolder: FolderDescriptor;
  let targetFile: FileDescriptorImpl;

  beforeEach(() => {
    rootFolder = new FolderDescriptorImpl();
    targetFile = new FileDescriptorImpl('target', rootFolder);
    rootFolder.addContent(targetFile);
    const stream = targetFile.getWriteableStream(false);
    stream.write('content');
    stream.end();
  });

  describe('HardLinkFileDescriptorImpl', () => {
    let hardLinkFileDescriptor: HardLinkFileDescriptorImpl;
    beforeEach(() => {
      hardLinkFileDescriptor = new HardLinkFileDescriptorImpl(targetFile, 'link', rootFolder);
      rootFolder.addContent(hardLinkFileDescriptor);
    });

    describe('initial state', () => {
      it('is not a folder', () => {
        expect(hardLinkFileDescriptor.isFolder).toBe(false);
      });

      it('is a link', () => {
        expect(hardLinkFileDescriptor.isLink).toBe(true);
      });

      it('is a hard link', () => {
        expect(hardLinkFileDescriptor.isHardLink).toBe(true);
      });

      it('has the same last modified date as the target file', () => {
        expect(hardLinkFileDescriptor.lastModified).toBe(targetFile.lastModified);
      });

      it('has the same size as the target file', () => {
        expect(hardLinkFileDescriptor.size).toBe(targetFile.size);
      });

      it('has the link name', () => {
        expect(hardLinkFileDescriptor.name).toBe('link');
      });

      it('has the link path', () => {
        expect(hardLinkFileDescriptor.path).toBe('/link');
      });
    });

    describe('content', () => {
      it('has the same content as the target file', () => {
        const content = hardLinkFileDescriptor.getReadableStream().read(10000);
        expect(content).toBe('content');
      });

      describe('when the target file content changes', () => {
        beforeEach(() => {
          targetFile.content.getWriteableStream(true).end(' new content');
        });

        it('has the same content as the target file', () => {
          const content = hardLinkFileDescriptor.getReadableStream().read(10000);
          expect(content).toBe('content new content');
        });
      });

      describe('when the hard link content changes', () => {
        beforeEach(() => {
          hardLinkFileDescriptor.getWriteableStream(false).end('new content');
        });

        it('has the same content as the target file', () => {
          const content = targetFile.getReadableStream().read(10000);
          expect(content).toBe('new content');
        });
      });
    });

    describe('copy', () => {
      let copy: FileDescriptor;
      beforeEach(() => {
        copy = hardLinkFileDescriptor.copy();
      });

      it('is not the same object', () => {
        expect(copy).not.toBe(hardLinkFileDescriptor);
      });

      it('has the same name', () => {
        expect(copy.name).toBe(hardLinkFileDescriptor.name);
      });

      it('has the same size', () => {
        expect(copy.size).toBe(hardLinkFileDescriptor.size);
      });
    });
  });
  describe('SoftLinkFileDescriptor', () => {
    let softLinkFileDescriptor: SoftLinkFileDescriptorImpl;
    beforeEach(() => {
      softLinkFileDescriptor = new SoftLinkFileDescriptorImpl(targetFile, 'link', rootFolder, rootFolder);
      rootFolder.addContent(softLinkFileDescriptor);
    });

    describe('initial state', () => {
      it('is not a folder', () => {
        expect(softLinkFileDescriptor.isFolder).toBe(false);
      });

      it('is a link', () => {
        expect(softLinkFileDescriptor.isLink).toBe(true);
      });

      it('is a soft link', () => {
        expect(softLinkFileDescriptor.isHardLink).toBe(false);
      });

      it('has the same last modified date as the target file', () => {
        expect(softLinkFileDescriptor.lastModified).toBe(targetFile.lastModified);
      });

      it('has the same size as the target file', () => {
        expect(softLinkFileDescriptor.size).toBe(targetFile.size);
      });

      it('has the link name', () => {
        expect(softLinkFileDescriptor.name).toBe('link');
      });

      it('has the link path', () => {
        expect(softLinkFileDescriptor.path).toBe('/link');
      });
    });

    describe('content', () => {
      it('has the same content as the target file', () => {
        const content = softLinkFileDescriptor.getReadableStream().read(10000);
        expect(content).toBe('content');
      });

      describe('when the target file content changes', () => {
        beforeEach(() => {
          targetFile.content.getWriteableStream(true).end(' new content');
        });

        it('has the same content as the target file', () => {
          const content = softLinkFileDescriptor.getReadableStream().read(10000);
          expect(content).toBe('content new content');
        });
      });

      describe('when the link content changes', () => {
        beforeEach(() => {
          softLinkFileDescriptor.getWriteableStream(false).end('new content');
        });

        it('has the same content as the target file', () => {
          const content = targetFile.getReadableStream().read(10000);
          expect(content).toBe('new content');
        });
      });
    });

    describe('dangling links', () => {
      describe('when the target file is removed', () => {
        beforeEach(() => {
          rootFolder.removeContent('target');
        });

        it('should throw an error', () => {
          expect(() => softLinkFileDescriptor.link).toThrow();
        });
      });
    });

    describe('copy', () => {
      let copy: FileDescriptor;
      beforeEach(() => {
        copy = softLinkFileDescriptor.copy();
      });

      it('is not the same object', () => {
        expect(copy).not.toBe(softLinkFileDescriptor);
      });

      it('has the same name', () => {
        expect(copy.name).toBe(softLinkFileDescriptor.name);
      });

      it('has the same size', () => {
        expect(copy.size).toBe(softLinkFileDescriptor.size);
      });
    });
  });
});
