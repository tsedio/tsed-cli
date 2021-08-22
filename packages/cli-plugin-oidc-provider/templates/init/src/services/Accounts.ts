import {Adapter, InjectAdapter} from "@tsed/adapters";
import {Injectable} from "@tsed/di";
import {deserialize} from "@tsed/json-mapper";
import {OidcAccountsMethods} from "@tsed/oidc-provider";
import {Account} from "../models/Account";

@Injectable()
export class Accounts implements OidcAccountsMethods {
  @InjectAdapter("accounts", Account)
  adapter: Adapter<Account>;

  async $onInit() {
    const accounts = await this.adapter.findAll();

    if (!accounts.length) {
      await this.adapter.create(
        deserialize(
          {
            email: "test@test.com",
            emailVerified: true
          },
          {useAlias: false}
        )
      );
    }
  }

  async findAccount(id: string) {
    return this.adapter.findById(id);
  }

  async authenticate(email: string) {
    return this.adapter.findOne({email});
  }
}
