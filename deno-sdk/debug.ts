export function debug() {
    return function(target: any, name: string, descriptor: PropertyDescriptor) {
        const f = descriptor.value!;
        descriptor.value = function(...args: any[]) {
            console.info("Function " + name + " called");
            console.info("Arguments are: ");
            console.info(...args);
            const res = f(...args);
            console.info("Returns: ");
            console.info(res);
            return res;
        }
    }
}