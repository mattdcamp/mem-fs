import { FolderDescriptor } from ".";

describe('folderDescriptor', () => {
  describe('root folders', () => {
    describe('creating a root folder', () => {
      let rootFolder: FolderDescriptor;
      beforeEach(() => {
        rootFolder = new FolderDescriptor();
      });
      it('should create a root folder', () => {
        expect(rootFolder).toBeDefined();
      });
      it('should have an empty name', () => {
        expect(rootFolder.name).toBe('');
      });
      it('should have a null parent', () => {
        expect(rootFolder.parent).toBeNull();
      });
      it('should have a path of /', () => {
        expect(rootFolder.path).toBe('/');
      });
    });
  });

  describe('sub folders', () => {
    let rootFolder: FolderDescriptor;
    let subFolder: FolderDescriptor;
    beforeEach(() => {
      rootFolder = new FolderDescriptor();
      subFolder = new FolderDescriptor('subFolder', rootFolder);
    });
    it('should create a sub folder', () => {
      expect(subFolder).toBeDefined();
    });
    it('should have a name', () => {
      expect(subFolder.name).toBe('subFolder');
    });
    it('should have the correct parent', () => {
      expect(subFolder.parent).toBe(rootFolder);
    });
    it('should have a path', () => {
      expect(subFolder.path).toBe('/subFolder/');
    });
  });
});