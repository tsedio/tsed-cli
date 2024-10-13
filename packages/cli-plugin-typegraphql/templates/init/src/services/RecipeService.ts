import {Injectable} from "@tsed/di";
import {Recipe} from "../resolvers.js";

@Injectable()
export class RecipeService {
  findById(id: string) {
    return new Recipe({id})
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAll(query: any) {
    return []
  }
}
