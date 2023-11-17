import { type Folder, forTesting } from "./folder";

describe('FolderImpl', () => {

  describe('Root Folders', () => {
    let folder: Folder;
    beforeEach(() => {
      folder = new forTesting.FolderImpl('/');
    });

    it('should have the correct name', () => {
      expect(folder.name).toBe('/');
    });

    it('should have no parent', () => {
      expect(folder.parent).toBeNull();
    });

    it('should have no children', () => {
      expect(folder.folders.length).toBe(0);
    });

    it('should have no files', () => {
      expect(folder.files.length).toBe(0);
    });

    it('should have the correct path', () => {
      expect(folder.path).toBe('/');
    });
  });

  describe('Nested Folders', () => {
    let rootFolder: Folder;
    let folder: Folder;
    beforeEach(() => {
      rootFolder = new forTesting.FolderImpl('/');
      folder = new forTesting.FolderImpl('folder', rootFolder);
    });

    it('should have the correct name', () => {
      expect(folder.name).toBe('folder');
    });

    it('should have the correct parent', () => {
      expect(folder.parent).toBe(rootFolder);
    });

    it('should have no children', () => {
      expect(folder.folders.length).toBe(0);
    });

    it('should have no files', () => {
      expect(folder.files.length).toBe(0);
    });

    it('should have the correct path', () => {
      expect(folder.path).toBe('/folder/');
    });
  });

});