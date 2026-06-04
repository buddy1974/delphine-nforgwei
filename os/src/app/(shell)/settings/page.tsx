import Settings from "./Settings";

export default function Page() {
  const channels = {
    supabase: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    openai: Boolean(process.env.OPENAI_API_KEY),
  };
  return <Settings channels={channels} />;
}
