import { CSMObjectRef, gateway } from "./csm.ts";
import axiod from "https://deno.land/x/axiod@0.24/mod.ts";
import USID from "https://deno.land/x/usid@1.0.2/mod.ts";
import { CSMObjectType, CSMStore } from "./store.ts";
import { FunctionNameId, InvokeObjectRequest } from "./server.ts";
import { InvokeRequest, UpdateRequest } from "./proto.ts";

export const FUNCTION_NAME = Deno.env.get('function_name')!;

export class CSMClient {
    private invokeId: string;
    private store: CSMStore;
    private usid = new USID();

    constructor(callId: string, store: CSMStore) {
        this.invokeId = callId;
        this.store = store;
    }

    getName(): string {
        return FUNCTION_NAME;
    }

    getId(): string {
        return this.invokeId;
    }

    get(key: CSMObjectRef): CSMObjectType | undefined {
        return this.store.read(key);
    }

    async invoke<T>(fname: string, ...args: any[]): Promise<T> {
        const invokeId = this.usid.uuid();
        const argList: InvokeObjectRequest[] = [];
        for (const arg of args) {
            let objArg: InvokeObjectRequest;
            if (typeof arg === "string" && this.store.hasObject(arg)) {
                this.store.share([fname, invokeId], arg);
                objArg = {
                    kind: "CSMObject",
                    key: arg,
                    val: this.store.read(arg)!,
                    share: this.store.getShareList(arg)!,
                };
            } else {
                objArg = {
                    kind: "Value",
                    val: arg,
                };
            }
            argList.push(objArg);
        }
        const req: InvokeRequest = {
            invokeId: invokeId,
            invokerId: this.invokeId,
            invokerName: FUNCTION_NAME,
            objects: argList,
        }
        const returnValue = (await axiod.post(gateway + fname + '/invoke', req)).data;
        this.store.unshare([fname, invokeId]);
        return returnValue;
    }

    newObject(value: CSMObjectType): CSMObjectRef {
        const ref = this.usid.uuid();
        const functionNameId: FunctionNameId = [FUNCTION_NAME, this.invokeId];
        this.store.merge(functionNameId, ref, {
            val: value,
            share: [functionNameId],
        });
        return ref;
    }

    async set(key: CSMObjectRef, val: CSMObjectType): Promise<void> {
        const shareList = this.store.getShareList(key);
        if (shareList) {
            this.store.update(key, val);
            const req: UpdateRequest = {
                key: key,
                val: val,
                modifier: this.invokeId,
            };
            await Promise.all(
                shareList?.map(share => share[0])
                    .filter(fname => fname !== FUNCTION_NAME)
                    .map(fname => axiod.post(gateway + fname + '/update', req))
            );
        }
    }
}