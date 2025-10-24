import { InfrastructureError } from '@/domain/exceptions'

export interface EmailConfig {
    smtpHost: string
    smtpPort: number
    smtpSecure: boolean
    smtpUser: string
    smtpPassword: string
    fromEmail: string
    fromName: string
}

export interface EmailMessage {
    to: string
    toName?: string
    subject: string
    htmlContent: string
    textContent?: string
    attachments?: EmailAttachment[]
}

export interface EmailAttachment {
    filename: string
    content: Buffer | string
    contentType?: string
    cid?: string // Para imágenes embebidas
}

export interface EmailTemplate {
    subject: string
    htmlTemplate: string
    textTemplate?: string
}

export interface EmailSendResult {
    success: boolean
    messageId?: string
    error?: string
    deliveryStatus?: 'sent' | 'queued' | 'failed'
}

export class EmailService {
    private config: EmailConfig

    constructor(config: EmailConfig) {
        this.config = config
        this.validateConfig()
    }

    private validateConfig(): void {
        if (!this.config.smtpHost) {
            throw new InfrastructureError('SMTP host es requerido')
        }
        if (!this.config.smtpUser) {
            throw new InfrastructureError('SMTP user es requerido')
        }
        if (!this.config.smtpPassword) {
            throw new InfrastructureError('SMTP password es requerido')
        }
        if (!this.config.fromEmail) {
            throw new InfrastructureError('From email es requerido')
        }
    }

    async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
        try {
            // En un entorno real, aquí usarías una librería como nodemailer
            // Por ahora, simularemos el envío
            
            console.log('📧 Enviando email:', {
                to: message.to,
                subject: message.subject,
                from: `${this.config.fromName} <${this.config.fromEmail}>`
            })

            // Simular delay de envío
            await new Promise(resolve => setTimeout(resolve, 100))

            // Simular éxito/fallo (95% éxito)
            const success = Math.random() > 0.05

            if (success) {
                return {
                    success: true,
                    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    deliveryStatus: 'sent'
                }
            } else {
                return {
                    success: false,
                    error: 'Error simulado de envío SMTP',
                    deliveryStatus: 'failed'
                }
            }

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido',
                deliveryStatus: 'failed'
            }
        }
    }

    async sendBulkEmails(messages: EmailMessage[]): Promise<EmailSendResult[]> {
        const results: EmailSendResult[] = []
        
        // Enviar en lotes para evitar sobrecarga
        const batchSize = 10
        for (let i = 0; i < messages.length; i += batchSize) {
            const batch = messages.slice(i, i + batchSize)
            const batchPromises = batch.map(message => this.sendEmail(message))
            const batchResults = await Promise.all(batchPromises)
            results.push(...batchResults)
            
            // Pausa entre lotes
            if (i + batchSize < messages.length) {
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }
        
        return results
    }

    async testConnection(): Promise<{ success: boolean; error?: string }> {
        try {
            // En un entorno real, aquí verificarías la conexión SMTP
            console.log('🔍 Probando conexión SMTP...')
            
            // Simular prueba de conexión
            await new Promise(resolve => setTimeout(resolve, 500))
            
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error de conexión'
            }
        }
    }

    // Templates de email predefinidos
    static getNotificationTemplate(): EmailTemplate {
        return {
            subject: '{{titulo}} - Sistema de Gestión de Riesgos',
            htmlTemplate: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>{{titulo}}</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f9fafb; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                        .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
                        .priority-critical { border-left: 4px solid #dc2626; }
                        .priority-high { border-left: 4px solid #ea580c; }
                        .priority-medium { border-left: 4px solid #d97706; }
                        .priority-low { border-left: 4px solid #16a34a; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>DELTA CONSULT</h1>
                            <p>Sistema de Gestión de Riesgos COSO II + ISO 27001</p>
                        </div>
                        <div class="content priority-{{prioridad}}">
                            <h2>{{titulo}}</h2>
                            <p>{{mensaje}}</p>
                            {{#if fechaVencimiento}}
                            <p><strong>Fecha límite:</strong> {{fechaVencimiento}}</p>
                            {{/if}}
                            {{#if urlAccion}}
                            <p><a href="{{urlAccion}}" class="button">Ver Detalles</a></p>
                            {{/if}}
                        </div>
                        <div class="footer">
                            <p>Este es un mensaje automático del Sistema de Gestión de Riesgos.</p>
                            <p>Por favor, no responda a este correo.</p>
                            <p>&copy; {{año}} DELTA CONSULT. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            textTemplate: `
                DELTA CONSULT - Sistema de Gestión de Riesgos
                
                {{titulo}}
                
                {{mensaje}}
                
                {{#if fechaVencimiento}}
                Fecha límite: {{fechaVencimiento}}
                {{/if}}
                
                {{#if urlAccion}}
                Ver detalles en: {{urlAccion}}
                {{/if}}
                
                ---
                Este es un mensaje automático del Sistema de Gestión de Riesgos.
                Por favor, no responda a este correo.
                
                © {{año}} DELTA CONSULT. Todos los derechos reservados.
            `
        }
    }

    static processTemplate(template: string, variables: Record<string, any>): string {
        let result = template

        // Reemplazar variables simples {{variable}}
        result = result.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
            const value = variables[variable]
            if (value !== undefined && value !== null) {
                if (value instanceof Date) {
                    return value.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }
                return String(value)
            }
            return ''
        })

        // Reemplazar condicionales simples {{#if variable}}...{{/if}}
        result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, variable, content) => {
            const value = variables[variable]
            return (value && value !== '' && value !== null && value !== undefined) ? content : ''
        })

        return result
    }

    createNotificationEmail(
        to: string,
        toName: string,
        titulo: string,
        mensaje: string,
        prioridad: string,
        fechaVencimiento?: Date,
        urlAccion?: string
    ): EmailMessage {
        const template = EmailService.getNotificationTemplate()
        
        const variables = {
            titulo,
            mensaje,
            prioridad: prioridad.toLowerCase(),
            fechaVencimiento,
            urlAccion,
            año: new Date().getFullYear()
        }

        const subject = EmailService.processTemplate(template.subject, variables)
        const htmlContent = EmailService.processTemplate(template.htmlTemplate, variables)
        const textContent = template.textTemplate 
            ? EmailService.processTemplate(template.textTemplate, variables)
            : undefined

        return {
            to,
            toName,
            subject,
            htmlContent,
            textContent
        }
    }

    // Configuración desde variables de entorno
    static fromEnvironment(): EmailService {
        const config: EmailConfig = {
            smtpHost: process.env.SMTP_HOST || 'localhost',
            smtpPort: parseInt(process.env.SMTP_PORT || '587'),
            smtpSecure: process.env.SMTP_SECURE === 'true',
            smtpUser: process.env.SMTP_USER || '',
            smtpPassword: process.env.SMTP_PASSWORD || '',
            fromEmail: process.env.FROM_EMAIL || 'noreply@deltaConsult.com',
            fromName: process.env.FROM_NAME || 'DELTA CONSULT - Sistema de Riesgos'
        }

        return new EmailService(config)
    }
}

// Implementación real con nodemailer (comentada para referencia)
/*
import nodemailer from 'nodemailer'

export class NodemailerEmailService extends EmailService {
    private transporter: nodemailer.Transporter

    constructor(config: EmailConfig) {
        super(config)
        this.transporter = nodemailer.createTransporter({
            host: config.smtpHost,
            port: config.smtpPort,
            secure: config.smtpSecure,
            auth: {
                user: config.smtpUser,
                pass: config.smtpPassword
            }
        })
    }

    async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
        try {
            const mailOptions = {
                from: `${this.config.fromName} <${this.config.fromEmail}>`,
                to: message.toName ? `${message.toName} <${message.to}>` : message.to,
                subject: message.subject,
                html: message.htmlContent,
                text: message.textContent,
                attachments: message.attachments?.map(att => ({
                    filename: att.filename,
                    content: att.content,
                    contentType: att.contentType,
                    cid: att.cid
                }))
            }

            const info = await this.transporter.sendMail(mailOptions)

            return {
                success: true,
                messageId: info.messageId,
                deliveryStatus: 'sent'
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido',
                deliveryStatus: 'failed'
            }
        }
    }

    async testConnection(): Promise<{ success: boolean; error?: string }> {
        try {
            await this.transporter.verify()
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error de conexión'
            }
        }
    }
}
*/