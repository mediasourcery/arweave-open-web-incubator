declare class uportconnect {
  constructor(
    name: string,
    opts?: {
      network?: string;
      bannerImage?: {
        [path: string]: string;
      };
      ethrConfig?: {
        rpcUrl?: string;
      };
    }
  );

  onResponse(
    name?: string
  ): Promise<{
    id: string;
    payload: {
      boxPub: string;
      did: string;
      name: string;
      publicEncKey: string;
      pushToken: string;
      [key: string]: any;
    };
  }>;

  requestDisclosure(
    opts: {
      requested?: string[];
      notifications?: boolean;
      verified?: string[];
    },
    name?: string
  ): void;

  sendVerification(opts: { exp?: number; claim: any }): void;
}
