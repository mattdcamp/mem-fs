import {
  type FileDescriptor,
  FileDescriptorImpl,
  type FolderDescriptor,
  FolderDescriptorImpl,
} from '../fileDescriptor';
import { findFilesRecursive } from './fileFinders';

describe('fileFinders', () => {
  let rootFolder: FolderDescriptor;
  let foundFile1: FileDescriptor;
  let foundFile2: FileDescriptor;
  let foundFile3: FileDescriptor;
  let foundFolder1: FolderDescriptor;
  let notFoundFile: FileDescriptor;
  let notFoundFolder: FolderDescriptor;

  beforeEach(() => {
    rootFolder = new FolderDescriptorImpl('root', null);
    foundFolder1 = new FolderDescriptorImpl('foundFolder', rootFolder);
    notFoundFolder = new FolderDescriptorImpl('notFoundFolder', rootFolder);

    foundFile1 = new FileDescriptorImpl('foundFile', rootFolder);
    foundFile2 = new FileDescriptorImpl('foundFile', foundFolder1);
    foundFile3 = new FileDescriptorImpl('foundFile', notFoundFolder);
    notFoundFile = new FileDescriptorImpl('notFoundFile', rootFolder);

    rootFolder.addContent(foundFolder1);
    rootFolder.addContent(notFoundFolder);

    rootFolder.addContent(foundFile1);
    foundFolder1.addContent(foundFile2);
    notFoundFolder.addContent(foundFile3);
    rootFolder.addContent(notFoundFile);
  });
  describe('findFilesRecursive', () => {
    it('finds all files with the given name', () => {
      const result = findFilesRecursive('foundFile', rootFolder);
      const paths = result.map((file) => file.path);

      expect(paths).toEqual(['/foundFolder/foundFile', '/notFoundFolder/foundFile', '/foundFile']);
    });

    it('finds folders with the given name', () => {
      const result = findFilesRecursive('foundFolder', rootFolder);
      const paths = result.map((file) => file.path);

      expect(paths).toEqual(['/foundFolder/']);
    });

    it('returns an empty array if no files are found', () => {
      const result = findFilesRecursive('nothing', rootFolder);
      const paths = result.map((file) => file.path);

      expect(paths).toEqual([]);
    });
  });
});
