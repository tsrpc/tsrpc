import { PackageA } from "@tsrpc/package-a";
import { PackageB } from "@tsrpc/package-b";
import { PackageB3 } from "../../package-b/src/not-export";

export function useA() {
    PackageA();
    PackageB();
    PackageB3();
    console.log('useA');
}