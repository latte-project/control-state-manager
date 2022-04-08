import axiod from "https://deno.land/x/axiod@0.24/mod.ts";
import USID from "https://deno.land/x/usid@1.0.2/mod.ts";
import { CSMClient } from "./client.ts";

export const gateway = "http://gateway.openfaas:8080/function/";

export type CSMObjectRef = string;
export type CloudFunctionType = (client: CSMClient, ...args: any[]) => any;

export class CSM {
    private localDb: Map<CSMObjectRef, any> = new Map();
    private usid = new USID();

    async invoke<T>(fname: string, ...args: any[]): Promise<T> {
        return (await axiod.post(gateway + fname + '/invoke', args)).data;
    }

    async newInteger(value: number) {
        const ref = this.usid.uuid();
        this.localDb.set(ref, value);
    }
}
