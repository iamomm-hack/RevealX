// Type declarations for crypto-js
declare module 'crypto-js' {
  export interface WordArray {
    toString(encoder?: any): string;
  }

  export namespace lib {
    export namespace WordArray {
      function random(nBytes: number): WordArray;
    }
  }

  export namespace AES {
    function encrypt(message: string, key: string): { toString(): string };
    function decrypt(ciphertext: string, key: string): WordArray;
  }

  export namespace enc {
    export const Utf8: {
      stringify(wordArray: WordArray): string;
    };
  }
}
