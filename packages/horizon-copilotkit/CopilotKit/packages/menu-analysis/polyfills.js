// File API polyfill for Node.js < 20
if (!globalThis.File) {
  globalThis.File = class File {
    constructor(fileBits, fileName, options = {}) {
      // Create a simple blob-like object that undici can work with
      const blob = {
        ...fileBits[0],
        name: fileName,
        type: options.type || 'application/octet-stream',
        size: fileBits[0]?.length || 0,
        lastModified: options.lastModified || Date.now(),
        stream() {
          return fileBits[0];
        },
        text() {
          return Promise.resolve(fileBits[0]?.toString() || '');
        },
        arrayBuffer() {
          return Promise.resolve(fileBits[0] || new ArrayBuffer(0));
        }
      };
      return blob;
    }
  };
}

// Also add Blob if needed
if (!globalThis.Blob) {
  globalThis.Blob = class Blob {
    constructor(fileBits = [], options = {}) {
      this.size = fileBits.reduce((acc, chunk) => acc + (chunk?.length || 0), 0);
      this.type = options.type || '';
      this._fileBits = fileBits;
    }
    
    stream() {
      return this._fileBits[0];
    }
    
    text() {
      return Promise.resolve(this._fileBits.join(''));
    }
    
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0));
    }
  };
}