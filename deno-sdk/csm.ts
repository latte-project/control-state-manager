import { CSMClient } from "./client.ts";

export const gateway = "http://gateway.openfaas:8080/function/";

export type CSMObjectRef = string;
export type CloudFunctionType = (client: CSMClient, ...args: any[]) => any;
