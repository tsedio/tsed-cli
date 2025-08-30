import {inject} from "@tsed/di";

import {CliProjectService} from "../services/CliProjectService.js";

export function render(id: string, data: Parameters<typeof CliProjectService.prototype.createFromTemplate>[1]) {
  return inject(CliProjectService).createFromTemplate(id, data);
}
