import { generatorHandler } from "@prisma/generator-helper";
import onManifest from "./onManifest";
import onGenerate  from "./onGenerate";

generatorHandler({
    onManifest: onManifest,
    onGenerate: onGenerate,
});
