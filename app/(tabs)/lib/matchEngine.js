export const createPlayers = (list) =>
  list.map((name) => ({
    name,
    runs: 0,
    balls: 0,
    out: false,
  }));

export const createBowlers = (list) =>
  list.map((name) => ({
    name,
    runs: 0,
    balls: 0,
    wickets: 0,
  }));

export const getOver = (balls) =>
  `${Math.floor(balls / 6)}.${balls % 6}`;

export const isAllOut = (batting) =>
  batting.filter((p) => !p.out).length <= 1;

export const isOversFinished = (balls, maxOvers) =>
  balls >= maxOvers * 6;