export class PrismaClient {
  $connect() { return Promise.resolve(); }
  $disconnect() { return Promise.resolve(); }
}

export const Prisma = {
  QueryMode: {
    insensitive: 'insensitive' as const,
    default: 'default' as const,
  },
  PrismaClientKnownRequestError: class extends Error {
    code: string;
    meta?: Record<string, unknown>;
    constructor(
      message: string,
      { code, meta }: { code: string; clientVersion?: string; meta?: Record<string, unknown> },
    ) {
      super(message);
      this.code = code;
      this.meta = meta;
    }
  },
};
