import {log, progress, spinner, taskLog} from "@clack/prompts";
import {contextLogger} from "@tsed/di";

export interface TaskLoggerOptions {
  title: string;
  index: number;
  type?: "group" | "taskLog" | "log" | "spinner" | "progress";
  parent?: TaskLogger;
  verbose?: boolean;
}

export class TaskLogger {
  readonly type: TaskLoggerOptions["type"];
  public max: number;
  #title: string;
  #logger: any;
  #verbose: boolean | undefined;
  #parent: TaskLogger | undefined;
  #index: number;

  constructor(opts: TaskLoggerOptions) {
    this.#title = opts.title;
    this.type = opts.type;
    this.#parent = opts.parent;
    this.#verbose = opts.verbose;

    this.#logger = this.create({
      ...opts,
      verbose: this.#verbose
    });
  }

  get parent() {
    return this.#parent;
  }

  get isReady() {
    return !!this.#logger;
  }

  get title() {
    return this.#title;
  }

  set title(title: string) {
    if (title) {
      this.#title = title;
      this.#logger.message?.(title);
    }
  }

  set output(message: string) {
    if (message) {
      (this.#logger.info || this.#logger.message)?.(message);
    }
  }

  static from(opts: TaskLoggerOptions) {
    if (opts.parent) {
      switch (opts.parent.type) {
        case "progress":
          return new TaskLogger({
            ...opts,
            type: "progress",
            parent: opts.parent
          });
        case "spinner":
          return opts.parent;
      }
    }

    if (opts.parent) {
      if (opts.parent?.parent) {
        opts.type = opts.type || "group";
      } else {
        opts.type = opts.type || "taskLog";
      }
    }

    opts.type = opts.type || "log";

    return new TaskLogger(opts);
  }

  log(message: string) {
    this.#logger.message(`${this.title} - ${message}`);
  }

  message(message: string) {
    this.#logger.message(`${this.title} - ${message}`);
  }

  advance() {
    if (this.isReady && this.type === "progress") {
      if (this.isRaw()) {
        this.info(`${this.title} [${this.#index}/${this.parent!.max}]`);
      } else {
        const it = Math.round((1 / this.parent!.max) * 100);
        this.#logger.advance(it, this.title);
      }
    }

    return this;
  }

  start() {
    if (this.isReady) {
      const msg = `${this.title}...`;
      switch (this.type) {
        default:
          this.#logger.message(msg);
          break;
        case "log":
          this.#logger.info(msg);
          break;
        case "progress":
          if (this.isChildProgress()) {
            this.advance();
          } else {
            this.#logger.start(this.title);
          }
          break;
        case "spinner":
          this.#logger.start(this.title);
          break;
      }
    }

    return this;
  }

  done() {
    if (this.isReady) {
      const msg = `${this.title} completed`;

      switch (this.type) {
        default:
          this.#logger.success(msg);
          break;
        case "progress":
          if (!this.isChildProgress()) {
            this.#logger.stop(msg);
          }
          break;
        case "spinner":
          this.#logger.stop(msg);
          break;
      }
    }

    return this;
  }

  error(message: string | Error) {
    if (this.isReady) {
      this.#logger.error(`${this.title} - ${message}`);
    }

    return this;
  }

  info(message: string) {
    if (this.isReady) {
      switch (this.type) {
        case "log":
        case "taskLog":
          this.#logger.info(`${this.title} - ${message}`);
          break;
        default:
          this.#logger.message(`${this.title} - ${message}`);
          break;
      }
    }

    return this;
  }

  warn(message: string) {
    if (this.isReady) {
      switch (this.type) {
        case "log":
        case "taskLog":
          this.#logger.warn(`${this.title} - ${message}`);
          break;
        default:
          this.#logger.message(`${this.title} - WARN ${message}`);
      }
    }

    return this;
  }

  skip() {
    if (this.isReady) {
      switch (this.type) {
        default:
        case "log":
          this.#logger.warn(`${this.title} skipped...`);
          break;
        case "group":
        case "taskLog":
          this.#logger.error(`${this.title} skipped...`);
          break;
        case "progress":
          this.advance();
          break;
        case "spinner":
          this.#logger.stop(`${this.title} skipped...`);
          break;
      }
    }
    return this;
  }

  /**
   * @ddeprecated use info or message instead
   * @param message
   */
  report(message: string) {
    (this.#logger.info || this.#logger.message)?.(message);
  }

  protected isChildProgress() {
    return this.parent?.type === "progress" && this.type === "progress";
  }

  protected create(opts: TaskLoggerOptions) {
    const {type, title, parent} = opts;

    if (this.isRaw()) {
      const success = (message: string) => {
        !this.isEnvTest() &&
          contextLogger()?.info({
            state: "SUCCESS",
            title,
            message
          });
      };
      const start = (message: string) => {
        !this.isEnvTest() &&
          contextLogger()?.info({
            title,
            message
          });
      };
      const defaultLogger = {
        message: (message: string) => {
          !this.isEnvTest() &&
            contextLogger()?.info({
              state: "MSG",
              title,
              message
            });
        },
        stop: success,
        success,
        info: start,
        start,
        warn: (message: string) => {
          !this.isEnvTest() &&
            contextLogger()?.warn({
              title,
              message
            });
        },
        error: (message: string) => {
          !this.isEnvTest() &&
            contextLogger()?.error({
              title,
              message
            });
        }
      };

      defaultLogger.message("...");
      return defaultLogger;
    }

    switch (type) {
      case "spinner":
        const spin = spinner();
        spin.message(title);

        return spin;
      case "progress":
        if (parent && this.isChildProgress()) {
          return parent.#logger;
        }

        return progress({
          style: "block",
          max: 100
        });

      case "taskLog":
        return taskLog({
          title: this.title
        });

      case "log":
        return log;

      case "group":
        if (!parent || parent.type !== "taskLog") {
          return log;
        }

        return parent.#logger.group(this.title);
    }
  }

  private isRaw() {
    return this.#verbose || this.isEnvTest();
  }

  private isEnvTest() {
    return process.env.NODE_ENV === "test";
  }
}
