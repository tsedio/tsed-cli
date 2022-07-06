import {Injectable} from "@tsed/di";
import {Recipe} from "../resolvers";

@Injectable()
export class RecipeService {
  async findById(id: string) {
    return new Recipe({id})
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findAll(query: any) {
    return []
  }
}
