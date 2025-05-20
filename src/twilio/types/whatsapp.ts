export const DEFAULT_MESSAGES = {
    NOT_HAVE_ACCOUNT: `
    Olá, que bom ter você com a gente! ⚽📊
Este canal é exclusivo para clientes StatsPro AI, com análises esportivas geradas por inteligência artificial.
\n
💥 Bônus especial: Você ainda não tem uma conta vinculada a este número, mas pode se cadastrar agora e ganhar 10 análises gratuitas para começar!
\n
👉 Ative seu acesso grátis https://statspro.ai/sign-up
`,
    SUPPORT: 'Para entrar em contato com o suporte humano, você pode enviar uma mensagem para o WhatsApp (21) 99342-9306. Estamos à disposição para te ajudar!',
    INVALID_OPTION: 'Selecione a opção correta.'
};

export const WhatsAppTwilioSessionStatus = {
  INITIALIZED: "INITIALIZED",
  FINALIZED: "FINALIZED",
} as const;

export type WhatsAppTwilioSessionStatus = typeof WhatsAppTwilioSessionStatus[keyof typeof WhatsAppTwilioSessionStatus];


export type TwilioPayload = {
    SmsMessageSid: string;
    NumMedia: string;
    ProfileName: string;
    MessageType: string;
    SmsSid: string;
    WaId: string;
    SmsStatus: string;
    Body: string;
    To: string;
    NumSegments: string;
    ReferralNumMedia: string;
    AccountSid: string;
    From: string;
    ApiVersion: string;
}