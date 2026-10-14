/**
 * VoiceNavAssistant has been completely upgraded to Ceo1983ChatAssistant.
 * All voice recognition, microphone listening, speech synthesis, and voice GPS navigation
 * have been removed as requested.
 *
 * It is now a pure intelligent AI chat assistant calling OpenRouter API with live app context.
 */
export {
  Ceo1983ChatAssistant as VoiceNavAssistant,
  Ceo1983ChatAssistant,
  isVoiceAiEnabled,
  setVoiceAiEnabled,
  VOICE_AI_STORAGE_KEY,
  VOICE_AI_EVENT_NAME,
  AI_CHARACTER_IMAGE,
} from "./Ceo1983ChatAssistant";
