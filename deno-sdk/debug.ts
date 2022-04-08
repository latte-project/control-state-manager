export function debug() {
    return function(target: any, name: string, descriptor: PropertyDescriptor) {
        const f = descriptor.value!;
        descriptor.value = async function(...args: any[]) {
            console.info(`Function ${name} arguments: `);
            console.info(...args);
            try {
                const res = await f.apply(this, args);
                console.info(`Function ${name} returns: `);
                console.info(res);
                return res;
            } catch (e) {
                console.info(`Function ${name} failed, reason ${e}`);
            }
        }
    }
}