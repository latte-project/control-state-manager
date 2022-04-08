import CSM from 'https://deno.land/x/csm@v0.3.0/csm.ts';

export function handle(csm: CSM, ...args: number[]) {
    return args.reduce((pv, cv) => pv + cv);
}