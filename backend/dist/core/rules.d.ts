import { Cita } from './domain';
export declare class BusinessRules {
    private static readonly DIAS_LABORALES;
    private static readonly DIAS_FIN_SEMANA;
    static esHorarioLaboral(fecha: Date): boolean;
    static validarCita(cita: Partial<Cita>): {
        valida: boolean;
        error?: string;
    };
}
//# sourceMappingURL=rules.d.ts.map