declare module 'bcryptjs' {
  export function genSaltSync(rounds?: number): string;
  export function genSalt(rounds?: number): Promise<string>;
  export function genSalt(
    rounds: number,
    callback: (err: Error | null, salt: string) => void
  ): void;

  export function hashSync(data: string | Buffer, saltOrRounds: string | number): string;
  export function hash(data: string | Buffer, saltOrRounds: string | number): Promise<string>;
  export function hash(
    data: string | Buffer,
    saltOrRounds: string | number,
    callback: (err: Error | null, hash: string) => void
  ): void;

  export function compareSync(data: string | Buffer, hash: string): boolean;
  export function compare(data: string | Buffer, hash: string): Promise<boolean>;
  export function compare(
    data: string | Buffer,
    hash: string,
    callback: (err: Error | null, result: boolean) => void
  ): void;

  export function getRounds(hash: string): number;
}
