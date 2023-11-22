import { type FileDescriptor, FileDescriptorImpl, FolderDescriptorImpl, FileContentImpl } from '.';
import { type Readable } from 'stream';

describe('fileDescriptor', () => {
  describe('creating a file', () => {
    let folder: FolderDescriptorImpl;
    let file: FileDescriptor;
    beforeEach(() => {
      folder = new FolderDescriptorImpl();
      file = new FileDescriptorImpl('file.txt', folder);
    });

    it('should create a file', () => {
      expect(file).toBeDefined();
    });

    it('should have the correct name', () => {
      expect(file.name).toBe('file.txt');
    });

    it('should have the correct path', () => {
      expect(file.path).toBe('/file.txt');
    });

    it('should have the correct parent', () => {
      expect(file.parent).toBe(folder);
    });
  });
});

describe('FileContentImpl', () => {
  let content: FileContentImpl;
  beforeEach(() => {
    content = new FileContentImpl();
  });

  describe('initialState', () => {
    it('should have a length of 0', () => {
      expect(content.size).toBe(0);
    });

    it('should have a content of ""', () => {
      expect(content.content).toBe('');
    });
  });
  describe('getWriteableStream', () => {
    it('should return a writeable stream', () => {
      expect(content.getWriteableStream()).toBeDefined();
    });

    it('should write to the content', () => {
      const stream = content.getWriteableStream();
      stream.write('new content');
      expect(content.content).toBe('new content');
    });

    describe('with existing content', () => {
      beforeEach(() => {
        content.content = 'existing content';
      });

      it('should overwrite the content', () => {
        const stream = content.getWriteableStream();
        stream.write('new content');
        expect(content.content).toBe('new content');
      });

      it('should append the content', () => {
        const stream = content.getWriteableStream(true);
        stream.write('new content');
        expect(content.content).toBe('existing contentnew content');
      });
    });

    describe('with locked content', () => {
      let stream: NodeJS.WritableStream;
      beforeEach(() => {
        stream = content.getWriteableStream();
      });

      it('should throw an error when opening the second concurrent stream', () => {
        expect(() => {
          content.getWriteableStream();
        }).toThrow();
      });

      it('should allow content to be written to the first stream even if an error has been thrown', () => {
        expect(() => {
          content.getWriteableStream();
        }).toThrow();
        stream.write('new content');
        expect(content.content).toBe('new content');
      });

      it('should allow a second stream to be opened after the first stream has been closed', () => {
        expect(() => {
          content.getWriteableStream();
        }).toThrow();
        stream.end();
        content.getWriteableStream();
      });
    });
  });

  describe('getReadableStream', () => {
    let stream: Readable;
    beforeEach(() => {
      stream = content.getReadableStream();
    });

    afterEach(() => {
      stream.destroy();
    });

    it('should return a readable stream', () => {
      expect(stream).toBeDefined();
      expect(stream.readable).toBe(true);
    });

    it('should return an empty stream', async () => {
      const chunks: string[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      expect(chunks.join('')).toBe('');
    });

    describe('with existing content', () => {
      beforeEach(() => {
        content.content = 'existing content';
        stream = content.getReadableStream();
      });

      it('should read the content', async () => {
        const chunks: string[] = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        expect(chunks.join('')).toBe('existing content');
      });
    });
  });
});
