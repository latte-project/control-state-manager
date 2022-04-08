import { handle } from './function/handler.ts';
import { listen } from "https://deno.land/x/csm@v0.4.19/mod.ts";

listen(3000, handle);