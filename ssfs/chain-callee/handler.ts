import { CSMClient, CSMObjectRef } from "https://deno.land/x/csm@v0.4.19/mod.ts";

export async function handle(csm: CSMClient, n: CSMObjectRef) {
    const i = csm.get(n) as number;
    await csm.set(n, i + 10);
    return;
}