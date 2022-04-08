import { CSMObjectRef } from "./csm.ts";
import { CSMObjectType, LocalDB } from "./proxy.ts";
export class CSMClient {
    private callId: string;
    private localDB: LocalDB;

    constructor(callId: string, db: LocalDB) {
        this.callId = callId;
        this.localDB = db;
    }

    get(key: CSMObjectRef): CSMObjectType | undefined {
        return this.localDB.get(key)?.val;
    }

    async invoke<T>(fname: string, ...args: any[]): Promise<T> {
        return undefined;
    }

    async newInteger(value: number) {

    }
}