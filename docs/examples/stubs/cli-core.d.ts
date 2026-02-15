export interface CommandProvider<Ctx = any> {
  $prompt?(initialOptions: Partial<Ctx>): Promise<any[]> | any[];
  $mapContext?(ctx: Partial<Ctx>): Ctx;
  $exec?(ctx: Ctx): Promise<any> | any;
}

export function Command(options: Record<string, any>): ClassDecorator;

export function command<Input = any>(options: {
  name: string;
  description: string;
  inputSchema?: any;
  handler(data: Input): Promise<any> | any;
}): {token(): symbol};
