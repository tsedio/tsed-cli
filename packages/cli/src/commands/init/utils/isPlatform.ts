export function isPlatform(...types: string[]) {
  return (ctx: any) => [types].includes(ctx.platform);
}
