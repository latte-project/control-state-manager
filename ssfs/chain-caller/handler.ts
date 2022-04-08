import { CSMClient } from "https://deno.land/x/csm@v0.4.19/mod.ts";

export async function handle(csm: CSMClient, n: number) {
    const id = csm.newObject(n);
    await csm.invoke('chain-callee', id);
    return csm.get(id);
}