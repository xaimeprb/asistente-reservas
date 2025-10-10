type Intent = {
    name: string;
    confidence: number;
    slots?: Record<string, string>;
};
export declare function detectIntentAndSlots(texto: string): Promise<{
    intent: Intent;
    slots: Record<string, string>;
}>;
export {};
//# sourceMappingURL=detectIntentAndSlots.d.ts.map