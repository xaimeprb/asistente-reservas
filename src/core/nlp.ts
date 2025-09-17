// Extracción de intención y slots con LLM

import OpenAI from 'openai';
import { config } from '../config';
import { Intent, Slot, ContextoConversacion } from './domain';

export class NLPService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  /**
   * Extrae la intención y slots de un mensaje de texto
   */
  async extraerIntencion(
    mensaje: string, 
    contexto: ContextoConversacion
  ): Promise<Intent> {
    const prompt = this.construirPrompt(mensaje, contexto);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: mensaje
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No se pudo obtener respuesta del LLM');
      }

      return this.parsearRespuesta(content);
    } catch (error) {
      console.error('Error en extracción de intención:', error);
      return {
        name: 'no_entendido',
        confidence: 0.1,
        slots: {}
      };
    }
  }

  private construirPrompt(mensaje: string, contexto: ContextoConversacion): string {
    return 
Eres un asistente de reservas médicas. Analiza el siguiente mensaje y extrae:

1. INTENCIÓN: Una de estas opciones:
   - agendar_cita: El cliente quiere agendar una cita
   - consultar_horarios: El cliente pregunta por horarios disponibles
   - cancelar_cita: El cliente quiere cancelar una cita
   - modificar_cita: El cliente quiere cambiar una cita existente
   - consultar_faq: El cliente hace una pregunta general
   - confirmar_datos: El cliente confirma información
   - no_entendido: No se puede determinar la intención

2. SLOTS: Extrae información relevante como:
   - nombre: Nombre del cliente
   - telefono: Número de teléfono
   - email: Correo electrónico
   - servicio: Tipo de servicio (consulta, revisión, tratamiento, limpieza, extracción)
   - fecha: Fecha deseada
   - hora: Hora deseada
   - motivo: Motivo de la consulta

Contexto de la conversación:
- Cliente: 
- Teléfono: 
- Última intención: 

Responde en formato JSON:
{
  "intencion": "nombre_intencion",
  "confianza": 0.95,
  "slots": {
    "nombre_slot": {
      "valor": "valor_extraido",
      "confianza": 0.9
    }
  }
}
;
  }

  private parsearRespuesta(content: string): Intent {
    try {
      const parsed = JSON.parse(content);
      const slots: Record<string, Slot> = {};

      if (parsed.slots) {
        for (const [name, slot] of Object.entries(parsed.slots)) {
          slots[name] = {
            name,
            value: (slot as any).valor || '',
            confidence: (slot as any).confianza || 0.5
          };
        }
      }

      return {
        name: parsed.intencion || 'no_entendido',
        confidence: parsed.confianza || 0.5,
        slots
      };
    } catch (error) {
      console.error('Error parseando respuesta del LLM:', error);
      return {
        name: 'no_entendido',
        confidence: 0.1,
        slots: {}
      };
    }
  }

  /**
   * Genera una respuesta natural basada en la intención
   */
  async generarRespuesta(
    intencion: Intent,
    contexto: ContextoConversacion
  ): Promise<string> {
    const prompt = 
Genera una respuesta natural y amigable en español para un asistente de reservas médicas.

Intención detectada: 
Confianza: 
Slots extraídos: 

Contexto:
- Cliente: 
- Teléfono: 

La respuesta debe ser:
- Natural y conversacional
- Útil y específica
- En español mexicano
- Máximo 2 oraciones

Responde solo con el texto de la respuesta, sin explicaciones adicionales.
;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      return response.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
    } catch (error) {
      console.error('Error generando respuesta:', error);
      return 'Lo siento, hubo un error procesando tu solicitud.';
    }
  }
}
