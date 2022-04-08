export function debug() {
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        const f = descriptor.value!;
        if (f.constructor === Function) {
            descriptor.value = function (...args: any[]) {
                console.info(`Function ${name} arguments: `);
                console.info(...args);
                const res = f.apply(this, args);
                console.info(`Function ${name} returns: `);
                console.info(res);
                return res;

            }
        } else {
            descriptor.value = async function (...args: any[]) {
                console.info(`Async Function ${name} arguments: `);
                console.info(...args);
                try {
                    const res = await f.apply(this, args);
                    console.info(`Async Function ${name} returns: `);
                    console.info(res);
                    return res;
                } catch (e) {
                    console.error(`Async Function ${name} failed, reason ${e}`);
                    console.error(e.stack);
                    return e;
                }
            }
        }
    }
}