import { drawsLeft, ownPieces, puzzleComplete, type PuzzleTeam } from './puzzleTeam';

/** Announce newly credited routes, never restored records or repeated callbacks. */
export function puzzleProgressFeedback(previous: PuzzleTeam | undefined, next: PuzzleTeam | undefined): string | undefined {
  if (!previous || !next || previous.id !== next.id) return;
  const added = next.pieces.filter(piece => !previous.pieces.some(old => old.id === piece.id));
  if (!added.length) return;
  if (!puzzleComplete(previous) && puzzleComplete(next)) {
    return `小队任务完成！大转盘已解锁，你可抽奖 ${drawsLeft(next)} 次。`;
  }
  const own = ownPieces(next).length;
  if (added.some(piece => piece.memberId === 'self')) {
    return own >= 2 ? '你已完成 2 条路线，下一棒交给搭子。' : `路线完成！小队进度 ${next.pieces.length}/3。`;
  }
  const member = next.members.find(member => member.id === added[added.length - 1].memberId);
  return `${member?.name ?? '搭子'}已完成路线，小队进度 ${next.pieces.length}/3。`;
}
