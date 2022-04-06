import axiod from "https://deno.land/x/axiod@0.24/mod.ts";
import USID from "https://deno.land/x/usid@1.0.2/mod.ts";

class CSM {
    private localDb: Map<string, any> = new Map();
    private usid = new USID();

    async invoke<T>(fname: string, ...args: any[]): Promise<T> {
        const gateway = "http://gateway.openfaas:8080/function/";
        return (await axiod.post(gateway + fname, args)).data;
    }

    async newInteger(value: number) {
        const ref = this.usid.uuid();
        this.localDb.set(ref, value);
    }
}

export default CSM;