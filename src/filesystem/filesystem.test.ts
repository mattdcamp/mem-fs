
import { FileSystem } from './filesystem';

describe('Filesystem', () => {
  describe('Initial Filesystem State', () => {
    let filesystem: FileSystem;
    beforeEach(() => {
      filesystem = new FileSystem();
    });

    it('should create a root folder with / as its path', () => {
      expect(filesystem.rootFolder.path).toBe('/');
    });

    it('should have no parent', () => {
      expect(filesystem.rootFolder.parent).toBeNull();  
    });

    it('should have no children', () => {
      expect(filesystem.rootFolder.folders.length).toBe(0);
    });

    it('should have no files', () => {
      expect(filesystem.rootFolder.files.length).toBe(0);
    }); 
  });
});