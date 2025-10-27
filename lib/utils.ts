export const raise = (msg: string): never => {
  throw new Error(msg);
};
