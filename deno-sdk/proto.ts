import { CSMObjectRef } from "./csm.ts";
import { InvokeObjectRequest } from "./server.ts";
import { CSMObjectType } from "./store.ts";

export type InvokeRequest = {
    invokeId: string, 
    invokerName: string, 
    invokerId: string, 
    objects: InvokeObjectRequest[],
};

export type InvokeResponse = [any];

export type UpdateRequest = {
    key: CSMObjectRef, 
    val: CSMObjectType, 
    modifier: string, 
};

export type UpdateResponse = ["OK"];