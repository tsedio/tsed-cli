export interface TaskLogger {
  message(text: string): void;
  info(text: string): void;
  warn(text: string): void;
}

export interface Task<Ctx = any> {
  title: string;
  skip?: boolean | string | ((ctx: Ctx) => boolean | string | Promise<boolean | string>);
  task(ctx: Ctx, logger: TaskLogger): Promise<any> | any;
}
