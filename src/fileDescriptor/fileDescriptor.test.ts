import { type FileDescriptor, FileDescriptorImpl, FolderDescriptorImpl } from '.';

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
