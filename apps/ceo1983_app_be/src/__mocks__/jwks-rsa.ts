export default function jwksClient(options?: any) {
  return {
    getSigningKey: jest.fn().mockImplementation((kid: string, cb: any) => {
      if (typeof cb === 'function') cb(null, { getPublicKey: () => 'mock-pub-key' });
      return Promise.resolve({ getPublicKey: () => 'mock-pub-key' });
    }),
  };
}

