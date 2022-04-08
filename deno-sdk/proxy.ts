import { NHttp } from "https://deno.land/x/nhttp@1.1.11/mod.ts";
import USID from "https://deno.land/x/usid@1.0.2/mod.ts";
import _ from "https://deno.land/x/lodash@4.17.19/lodash.js";
import { CSMClient } from "./client.ts";
import { CSMObjectRef, CloudFunctionType } from "./csm.ts";

type InvokeObjectRequest = CSMObjectArgument | ValueArgument;

type CSMObjectArgument = {
    kind: "CSMObject", 
    key: CSMObjectRef, 
    val: CSMObjectType,
    share: string[],
};

type ValueArgument = {
    kind: "Value", 
    val: CSMObjectType,
};

export type CSMObjectType = number | string | boolean;
type CSMObjectRecord = {
    val: CSMObjectType, 
    share: string[],
};
export type LocalDB = Map<CSMObjectRef, CSMObjectRecord>;

class CSMProxy {
    private localDB: LocalDB = new Map();
    private holdingTable: Map<string, CSMObjectRef[]> = new Map();
    private usid = new USID();
    private cloudFunction: CloudFunctionType;

    private cleanSharing(invokeId: string) {
        for (const key of this.holdingTable.get(invokeId)!) {
            _.pull(this.localDB.get(key)?.share, invokeId);
        }
        this.holdingTable.delete(invokeId);
    }

    constructor(cloudFunction: CloudFunctionType) {
        this.cloudFunction = cloudFunction;
    }

    async call(args: any[]): Promise<any> {
        const callId = this.usid.uuid();
        const client = new CSMClient(callId, this.localDB);
        this.holdingTable.set(callId, []);
        const returnValue = await this.cloudFunction(client, args);
        this.cleanSharing(callId);
        return returnValue;
    }

    async invoke(invokeId: string, invoker: string, args: InvokeObjectRequest[]): Promise<any> {
        const client = new CSMClient(invokeId, this.localDB);
        const holds: CSMObjectRef[] = [];
        const argList = [];
        for (const arg of args) {
            switch (arg.kind) {
                case "CSMObject":
                    const key = arg.key;
                    const record = {
                        val: arg.val, 
                        share: arg.share,
                    };
                    if (this.localDB.has(key)) {
                        const oldRecord = this.localDB.get(key)!;
                        record.share = _.uniq(_.concat(oldRecord.share, arg.share));
                    }
                    this.localDB.set(key, record);
                    holds.push(key);
                    argList.push(key);
                    break;
                case "Value":
                    argList.push(arg.val);
                    break;
            }
        }
        this.holdingTable.set(invokeId, holds);
        const returnValue = await this.cloudFunction(client, ...argList);
        this.cleanSharing(invokeId);
        return returnValue;
    }
}

export function listen(port: number, func: (client: CSMClient, ...args: any[]) => any) {




const app = new NHttp();
const csm = new CSM();
const typedHandle = handle as (csm: CSM, ...args: any[]) => any;

app.post("/call", async (rev) => {
    const args = parseQuery(rev.body);
    return rev.response.send(await typedHandle(csm, ...args));
});

app.get("/*", (rev) => {
    return rev.response.send("Hello get");
});

app.post("/*", (rev) => {
    return rev.response.send("Hello post");
});

app.listen(3000);

function parseQuery(args: any): any[] {
    if (Array.isArray(args)) {
        return args;
    } else {
        console.info(args);
        throw new Error('query.args is not an array' + JSON.parse(args));
    }
}
}