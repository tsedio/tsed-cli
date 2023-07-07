import axios from "axios";
import {DITest} from "@tsed/di";
import {CliHttpClient} from "./CliHttpClient";
import {CliProxyAgent} from "./CliProxyAgent";

jest.mock("axios");
describe("CliHttpClient", () => {
  beforeEach(() => DITest.create());
  afterEach(() => DITest.reset());

  describe("$afterInit()", () => {
    it("should call $afterInit method", async () => {
      const cliProxyAgent = {
        resolveProxySettings: jest.fn()
      };
      const client = await DITest.invoke<CliHttpClient>(CliHttpClient, [
        {
          token: CliProxyAgent,
          use: cliProxyAgent
        }
      ]);

      await client.$afterInit();

      expect(cliProxyAgent.resolveProxySettings).toHaveBeenCalled();
    });
  });
  describe("head()", () => {
    it("should call head method", async () => {
      // GIVEN
      const client = await DITest.invoke<CliHttpClient>(CliHttpClient);

      (axios as any).mockReturnValue(
        Promise.resolve({
          headers: {
            "x-request-id": "id"
          }
        })
      );

      // WHEN
      const result = await client.head("http://localhost/test", {
        params: {},
        headers: {
          "x-request-id": "id"
        }
      });

      expect(result).toEqual({
        "x-request-id": "id"
      });
      expect(axios).toHaveBeenCalledWith({
        url: "http://localhost/test",
        method: "HEAD",
        params: {},
        data: undefined,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-request-id": "id"
        }
      });
    });
  });
  describe("get()", () => {
    it("should call call send", async () => {
      // GIVEN
      const client = await DITest.invoke<CliHttpClient>(CliHttpClient);

      const model = {
        productId: "AGAC",
        resortArrivalDate: new Date("2020-05-01"),
        duration: 7,
        numberAttendees: 2
      };

      (axios as any).mockReturnValue(
        Promise.resolve({
          headers: {},
          data: {
            id: "id",
            additionalProperties: "hello"
          }
        })
      );

      // WHEN
      const result = await client.get("http://localhost/test", {
        params: model,
        headers: {
          "x-api": "x-api"
        }
      });

      expect(result).toEqual({
        additionalProperties: "hello",
        id: "id"
      });
      expect(axios).toHaveBeenCalledWith({
        url: "http://localhost/test",
        method: "GET",
        params: model,
        data: undefined,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-api": "x-api"
        },
        paramsSerializer: expect.any(Function)
      });
    });
  });
  describe("post()", () => {
    it("should call call send", async () => {
      // GIVEN
      const client = await DITest.invoke<CliHttpClient>(CliHttpClient);

      const model: any = {};
      model.productId = "AGAC";
      model.resortArrivalDate = new Date("2020-05-01");
      model.duration = 7;
      model.numberAttendees = 2;

      (axios as any).mockReturnValue(
        Promise.resolve({
          headers: {},
          data: {
            id: "id",
            additionalProperties: "hello"
          }
        })
      );

      // WHEN
      const result = await client.post("http://localhost/test", {
        data: model,
        headers: {
          "x-api": "x-api"
        }
      });

      expect(result).toEqual({
        additionalProperties: "hello",
        id: "id"
      });
      expect(axios).toHaveBeenCalledWith({
        url: "http://localhost/test",
        method: "POST",
        params: undefined,
        data: model,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-api": "x-api"
        },
        paramsSerializer: expect.any(Function)
      });
    });
  });
  describe("put()", () => {
    it("should call call send", async () => {
      // GIVEN
      const client = await DITest.invoke<CliHttpClient>(CliHttpClient);

      const model: any = {};
      model.productId = "AGAC";
      model.resortArrivalDate = new Date("2020-05-01");
      model.duration = 7;
      model.numberAttendees = 2;

      (axios as any).mockReturnValue(
        Promise.resolve({
          headers: {},
          data: {
            id: "id",
            hello: "hello"
          }
        })
      );

      // WHEN
      const result = await client.put("http://localhost/test", {
        data: model,
        headers: {
          "x-api": "x-api"
        }
      });

      expect(result).toEqual({
        hello: "hello",
        id: "id"
      });
      expect(axios).toHaveBeenCalledWith({
        url: "http://localhost/test",
        method: "PUT",
        data: model,
        params: undefined,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-api": "x-api"
        },
        paramsSerializer: expect.any(Function)
      });
    });
  });
  describe("delete()", () => {
    it("should call call send", async () => {
      // GIVEN
      const client = await DITest.invoke<CliHttpClient>(CliHttpClient);

      const model: any = {};
      model.productId = "AGAC";
      model.resortArrivalDate = new Date("2020-05-01");
      model.duration = 7;
      model.numberAttendees = 2;

      (axios as any).mockReturnValue(
        Promise.resolve({
          headers: {},
          data: {
            id: "id",
            additionalProperties: "hello"
          }
        })
      );

      // WHEN
      const result = await client.delete("http://localhost/test", {
        params: model,
        headers: {
          "x-api": "x-api"
        }
      });

      expect(result).toEqual({
        additionalProperties: "hello",
        id: "id"
      });
      expect(axios).toHaveBeenCalledWith({
        url: "http://localhost/test",
        method: "DELETE",
        params: model,
        data: undefined,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-api": "x-api"
        },
        paramsSerializer: expect.any(Function)
      });
    });
  });
});
