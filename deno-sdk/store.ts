import { CSMObjectRef } from "./csm.ts";
import "https://deno.land/x/lodash@4.17.19/lodash.js";
import { FunctionNameId } from "./server.ts";


const _ = (self as any)._;

export type CSMObjectType = number | string | boolean;
export type CSMObjectRecord = {
    val: CSMObjectType, 
    share: FunctionNameId[],
};
export type LocalDB = Map<CSMObjectRef, CSMObjectRecord>;

export class CSMStore {
    private localDB: LocalDB = new Map();
    private holdingTable: Map<string, CSMObjectRef[]> = new Map();

    private initOrPush(invokeNameId: FunctionNameId, ref: CSMObjectRef) {
        const key = invokeNameId[0] + invokeNameId[1];
        if (this.holdingTable.has(key)) {
            this.holdingTable.get(key)!.push(ref);
        } else {
            this.holdingTable.set(key, [ref]);
        }
    }

    read(key: CSMObjectRef): CSMObjectType | undefined {
        return this.localDB.get(key)?.val;
    }

    getShareList(key: CSMObjectRef): FunctionNameId[] | undefined {
        return this.localDB.get(key)?.share;
    }

    update(key: CSMObjectRef, val: CSMObjectType) {
        this.localDB.get(key)!.val = val;
    }

    merge(invokeId: FunctionNameId, key: CSMObjectRef, record: CSMObjectRecord) {
        this.initOrPush(invokeId, key);
        if (this.localDB.has(key)) {
            // { k -> v1, [s1, s2] } 
            // { k -> v2, [s2, s3] }
            // ---
            // { k -> v2, [s1, s2, s3] }
            const oldRecord = this.localDB.get(key)!;
            oldRecord.share = _.uniq(_.concat(oldRecord.share, record.share));
            oldRecord.val = record.val;
        } else {
            this.localDB.set(key, record);
        }
    }

    share(invokeId: FunctionNameId, key: CSMObjectRef) {
        this.initOrPush(invokeId, key);
        this.localDB.get(key)!.share.push(invokeId);
    }

    unshare(invokeId: FunctionNameId) {
        const invoker = invokeId[0] + invokeId[1];
        if (this.holdingTable.has(invoker)) {
            for (const key of this.holdingTable.get(invoker)!) {
                _.pull(this.localDB.get(key)!.share, invokeId);
            }
            this.holdingTable.delete(invoker);
        }
    }

    hasObject(key: string): boolean {
        return this.localDB.has(key);
    }
}