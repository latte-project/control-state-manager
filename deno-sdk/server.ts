import { NHttp } from "https://deno.land/x/nhttp@1.1.11/mod.ts";
import USID from "https://deno.land/x/usid@1.0.2/mod.ts";
import { CSMClient } from "./client.ts";
import { CSMObjectRef, CloudFunctionType } from "./csm.ts";
import { CSMObjectType, CSMStore } from "./store.ts";
import { InvokeRequest, UpdateRequest } from "./proto.ts";
import { FUNCTION_NAME } from "./client.ts";
import { debug } from "./debug.ts";

export type InvokeObjectRequest = CSMObjectArgument | ValueArgument;
export type FunctionName = string;
export type FunctionId = string;
export type FunctionNameId = [FunctionName, FunctionId];

export type CSMObjectArgument = {
    kind: "CSMObject", 
    key: CSMObjectRef, 
    val: CSMObjectType,
    share: [FunctionName, FunctionId][],
};

export type ValueArgument = {
    kind: "Value", 
    val: CSMObjectType,
};

class CSMServer {
    private store = new CSMStore();
    private usid = new USID();
    private cloudFunction: CloudFunctionType;

    constructor(cloudFunction: CloudFunctionType) {
        this.cloudFunction = cloudFunction;
    }

    @debug()
    async call(args: CSMObjectType[]): Promise<any> {
        const callId = this.usid.uuid();
        const invoker: FunctionNameId = ["user-client", "user-id"];
        return this.invoke(callId, invoker, args.map(arg => ({ kind: "Value", val: arg })));
    }

    @debug()
    async invoke(invokeId: string, invoker: FunctionNameId, args: InvokeObjectRequest[]): Promise<any[]> {
        const client = new CSMClient(invokeId, this.store);
        const argList = [];
        for (const arg of args) {
            switch (arg.kind) {
                case "CSMObject":
                    const key = arg.key;
                    const record = {
                        val: arg.val, 
                        share: arg.share,
                    };
                    this.store.merge(invoker, key, record);
                    argList.push(key);
                    break;
                case "Value":
                    argList.push(arg.val);
                    break;
            }
        }
        const returnValue = await this.cloudFunction(client, ...argList);
        this.store.unshare([FUNCTION_NAME, invokeId]);
        if (returnValue) {
            return [returnValue];
        } else {
            return ["OK"];
        }
    }

    @debug()
    async update(key: string, val: CSMObjectType, modifier: string): Promise<string[]> {
        this.store.update(key, val);
        return ["OK"];
    }
}

export function listen(port: number, func: (client: CSMClient, ...args: any[]) => any) {
    const app = new NHttp();
    const csm = new CSMServer(func);

    app.post("/call", async (rev) => {
        const args = rev.body as CSMObjectType[];
        return rev.response.send(await csm.call(args));
    });

    app.post("/invoke", async (rev) => {
        const args = rev.body as InvokeRequest;
        return rev.response.send(await csm.invoke(args.invokeId, [args.invokerName, args.invokeId], args.objects));
    });

    app.post("/update", async (rev) => {
        const args = rev.body as UpdateRequest;
        return rev.response.send(await csm.update(args.key, args.val, args.modifier));
    });

    app.get("/*", (rev) => {
        return rev.response.send("Hello get");
    });
    
    app.post("/*", (rev) => {
        return rev.response.send("Hello post");
    });

    app.listen(port);
}