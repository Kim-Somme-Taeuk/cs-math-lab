export type TruthValues = {
  p: boolean;
  q: boolean;
};

export function implication(p: boolean, q: boolean) {
  return !p || q;
}

export function biconditional(p: boolean, q: boolean) {
  return p === q;
}

export function evaluateLogic({ p, q }: TruthValues) {
  return {
    and: p && q,
    or: p || q,
    notP: !p,
    notQ: !q,
    implication: implication(p, q),
    biconditional: biconditional(p, q),
  };
}
