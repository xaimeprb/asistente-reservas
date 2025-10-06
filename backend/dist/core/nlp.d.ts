import { Intent } from './domain';
export declare function detectIntentAndSlots(texto: string): Promise<{
    intent: Intent;
    slots: Record<string, string>;
}>;
//# sourceMappingURL=nlp.d.ts.map