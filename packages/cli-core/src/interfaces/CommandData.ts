declare global {
  namespace TsED {
    interface InitialCommandData {}
  }
}

export interface CommandData extends TsED.InitialCommandData {
  commandName?: string;
  verbose?: boolean;
  bindLogger?: boolean;
  rawArgs?: string[];
}
