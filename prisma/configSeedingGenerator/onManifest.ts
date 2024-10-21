import type { GeneratorManifest } from '@prisma/generator-helper';

export default function onManifest(): GeneratorManifest {
    return {
        defaultOutput: './seedingOutput',
        prettyName: 'Seeding Config',
    };
}
