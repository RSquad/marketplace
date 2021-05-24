import { BigNumber } from "bignumber.js";

export const greaterThan = (a: any, b: any) => {
  const x = new BigNumber(a);
  return x.isGreaterThan(b);
};

export const lessThanOrEqualTo = (a: any, b: any) => {
  const x = new BigNumber(a);
  return x.isLessThanOrEqualTo(b);
};

export const div = (a: any, b: any) => {
  const x = new BigNumber(a);
  return x.dividedBy(b).toString();
};

export const mul = (a: any, b: any) => {
  const x = new BigNumber(a);
  return x.multipliedBy(b).toString();
};

export const minus = (a: any, b: any) => {
  const x = new BigNumber(a);
  return x.minus(b).toString();
};

export const plus = (a: any, b: any) => {
  const x = new BigNumber(a);
  return x.plus(b).toString();
};
