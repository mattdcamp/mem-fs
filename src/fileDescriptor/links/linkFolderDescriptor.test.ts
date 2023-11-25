import { HardLinkFolderDescriptorImpl, SoftLinkFolderDescriptorImpl } from './linkFolderDescriptor';
import { type FolderDescriptor, FolderDescriptorImpl, FileDescriptorImpl } from '..';

describe('LinkFolderDescriptor', () => {
  let rootFolder: FolderDescriptor;
  let targetFolder: FolderDescriptor;

  beforeEach(() => {
    rootFolder = new FolderDescriptorImpl();
    targetFolder = new FolderDescriptorImpl('target', rootFolder);
    rootFolder.addContent(targetFolder);
  });

  describe('HardLinkFolderDescriptorImpl', () => {
    let hardLinkFolderDescriptor: HardLinkFolderDescriptorImpl;
    beforeEach(() => {
      hardLinkFolderDescriptor = new HardLinkFolderDescriptorImpl(targetFolder, 'link', rootFolder);
      rootFolder.addContent(hardLinkFolderDescriptor);
    });

    describe('initial state', () => {
      it('is a folder', () => {
        expect(hardLinkFolderDescriptor.isFolder).toBe(true);
      });

      it('is a link', () => {
        expect(hardLinkFolderDescriptor.isLink).toBe(true);
      });

      it('is a hard link', () => {
        expect(hardLinkFolderDescriptor.isHardLink).toBe(true);
      });

      it('has no parent', () => {
        expect(hardLinkFolderDescriptor.parent).toBe(rootFolder);
      });

      it('has the same children as the target folder', () => {
        expect(hardLinkFolderDescriptor.children).toEqual(targetFolder.children);
      });

      it('has the same folders as the target folder', () => {
        expect(hardLinkFolderDescriptor.folders).toEqual(targetFolder.folders);
      });

      it('has the same files as the target folder', () => {
        expect(hardLinkFolderDescriptor.files).toEqual(targetFolder.files);
      });

      it('has the same last modified date as the target folder', () => {
        expect(hardLinkFolderDescriptor.lastModified).toBe(targetFolder.lastModified);
      });

      it('has the same size as the target folder', () => {
        expect(hardLinkFolderDescriptor.size).toBe(targetFolder.size);
      });

      it('has the link name', () => {
        expect(hardLinkFolderDescriptor.name).toBe('link');
      });

      it('has the link path', () => {
        expect(hardLinkFolderDescriptor.path).toBe('/link/');
      });
    });

    describe('add content', () => {
      let newFolder: FolderDescriptor;
      beforeEach(() => {
        newFolder = new FolderDescriptorImpl('newFolder');
      });

      describe('when content is added to the target folder', () => {
        beforeEach(() => {
          newFolder.parent = targetFolder;
          targetFolder.addContent(newFolder);
        });

        it('updates the content of the link', () => {
          expect(hardLinkFolderDescriptor.folders).toContain(newFolder);
        });
      });

      describe('when content is added to the link', () => {
        beforeEach(() => {
          newFolder.parent = hardLinkFolderDescriptor;
          hardLinkFolderDescriptor.addContent(newFolder);
        });

        it('updates the content of the target folder', () => {
          expect(targetFolder.folders).toContain(newFolder);
        });
      });
    });

    describe('remove content', () => {
      let newFolder: FolderDescriptor;
      beforeEach(() => {
        newFolder = new FolderDescriptorImpl('newFolder');
        newFolder.parent = targetFolder;
        targetFolder.addContent(newFolder);
      });

      describe('when content is removed from the target folder', () => {
        beforeEach(() => {
          targetFolder.removeContent('newFolder');
        });

        it('updates the content of the link', () => {
          expect(hardLinkFolderDescriptor.findChild('newFolder')).toBeNull();
        });
      });

      describe('when content is removed from the link', () => {
        beforeEach(() => {
          hardLinkFolderDescriptor.removeContent('newFolder');
        });

        it('updates the content of the target folder', () => {
          expect(targetFolder.findChild('newFolder')).toBeNull();
        });
      });
    });

    describe('copy', () => {
      let copy: FolderDescriptor;
      beforeEach(() => {
        copy = hardLinkFolderDescriptor.copy();
      });

      it('returns a new instance', () => {
        expect(copy).not.toBe(hardLinkFolderDescriptor);
      });

      it('has the same name', () => {
        expect(copy.name).toBe(hardLinkFolderDescriptor.name);
      });

      it('has the same files and folders', () => {
        expect(copy.children).toEqual(hardLinkFolderDescriptor.children);
      });

      it('is a folder', () => {
        expect(copy.isFolder).toBe(hardLinkFolderDescriptor.isFolder);
      });
    });
  });

  describe('SoftLinkFolderDescriptorImpl', () => {
    let softLinkFolderDescriptor: SoftLinkFolderDescriptorImpl;
    beforeEach(() => {
      softLinkFolderDescriptor = new SoftLinkFolderDescriptorImpl(targetFolder, 'link', rootFolder, rootFolder);
      rootFolder.addContent(softLinkFolderDescriptor);
    });

    describe('initial state', () => {
      it('is a folder', () => {
        expect(softLinkFolderDescriptor.isFolder).toBe(true);
      });

      it('is a link', () => {
        expect(softLinkFolderDescriptor.isLink).toBe(true);
      });

      it('is a hard link', () => {
        expect(softLinkFolderDescriptor.isHardLink).toBe(false);
      });

      it('has no parent', () => {
        expect(softLinkFolderDescriptor.parent).toBe(rootFolder);
      });

      it('has the same content as the target folder', () => {
        expect(softLinkFolderDescriptor.children).toEqual(targetFolder.children);
      });

      it('has the same last modified date as the target folder', () => {
        expect(softLinkFolderDescriptor.lastModified).toBe(targetFolder.lastModified);
      });

      it('has the same size as the target folder', () => {
        expect(softLinkFolderDescriptor.size).toBe(targetFolder.size);
      });

      it('has the link name', () => {
        expect(softLinkFolderDescriptor.name).toBe('link');
      });

      it('has the link path', () => {
        expect(softLinkFolderDescriptor.path).toBe('/link/');
      });
    });

    describe('add content', () => {
      let newFolder: FolderDescriptor;
      beforeEach(() => {
        newFolder = new FolderDescriptorImpl('newFolder');
      });

      describe('when content is added to the target folder', () => {
        beforeEach(() => {
          newFolder.parent = targetFolder;
          targetFolder.addContent(newFolder);
        });

        it('updates the content of the link', () => {
          expect(softLinkFolderDescriptor.folders).toContain(newFolder);
        });
      });

      describe('when content is added to the link', () => {
        beforeEach(() => {
          newFolder.parent = softLinkFolderDescriptor;
          softLinkFolderDescriptor.addContent(newFolder);
        });

        it('updates the content of the target folder', () => {
          expect(targetFolder.folders).toContain(newFolder);
        });
      });
    });

    describe('remove content', () => {
      let newFolder: FolderDescriptor;
      beforeEach(() => {
        newFolder = new FolderDescriptorImpl('newFolder');
        newFolder.parent = targetFolder;
        targetFolder.addContent(newFolder);
      });

      describe('when content is removed from the target folder', () => {
        beforeEach(() => {
          targetFolder.removeContent('newFolder');
        });

        it('updates the content of the link', () => {
          expect(softLinkFolderDescriptor.findChild('newFolder')).toBeNull();
        });
      });

      describe('when content is removed from the link', () => {
        beforeEach(() => {
          softLinkFolderDescriptor.removeContent('newFolder');
        });

        it('updates the content of the target folder', () => {
          expect(targetFolder.findChild('newFolder')).toBeNull();
        });
      });
    });

    describe('copy', () => {
      let copy: FolderDescriptor;
      beforeEach(() => {
        copy = softLinkFolderDescriptor.copy();
      });

      it('returns a new instance', () => {
        expect(copy).not.toBe(softLinkFolderDescriptor);
      });

      it('has the same name', () => {
        expect(copy.name).toBe(softLinkFolderDescriptor.name);
      });

      it('has the same content', () => {
        expect(copy.children).toEqual(softLinkFolderDescriptor.children);
      });

      it('is a folder', () => {
        expect(copy.isFolder).toBe(softLinkFolderDescriptor.isFolder);
      });
    });

    describe('dangling links', () => {
      beforeEach(() => {
        rootFolder.removeContent('target');
      });

      it('throws error when accessing the link', () => {
        expect(() => softLinkFolderDescriptor.children).toThrow();
      });
    });

    describe('when the link changes to a file', () => {
      beforeEach(() => {
        rootFolder.removeContent('target');
        rootFolder.addContent(new FileDescriptorImpl('target', rootFolder));
      });

      it('throws error when accessing the link', () => {
        expect(() => softLinkFolderDescriptor.children).toThrow();
      });
    });
  });
});
