import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, X, Send, Mic, MicOff, Volume2, VolumeX, 
  ShieldCheck, AlertTriangle, Sparkles, ChevronDown, 
  ExternalLink, FileText, CheckCircle2, Globe, Eye,
  Lock, ArrowRight, RefreshCw, MessageSquare
} from 'lucide-react';
import { 
  ChatMessage, SupportedLanguage, DocumentChecklistItem 
} from '../../types';
import { 
  processClientChatMessage, 
  generateProactiveIdpAlert, 
  generateBiometricGuidanceTip,
  LANGUAGE_LOCALES,
  playTextToSpeech,
  stopTextToSpeech
} from '../../services/conversationalAiService';
import { realtimeSyncBus } from '../../services/realtimeSyncService';

interface ClientChatbotWidgetProps {
  destinationCountry?: string;
  currentStep?: string;
  applicantRef?: string;
  applicantName?: string;
  flaggedDocuments?: DocumentChecklistItem[];
  onActionTrigger?: (actionType: string, docId?: string) => void;
}

export const ClientChatbotWidget: React.FC<ClientChatbotWidgetProps> = ({
  destinationCountry = 'France / Schengen Area',
  currentStep = 'appointment',
  applicantRef = 'VFS-2026-LON-9824',
  applicantName = 'Elena Rostova',
  flaggedDocuments = [],
  onActionTrigger,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(1);
  const [showPiiInspector, setShowPiiInspector] = useState<boolean>(false);
  const [selectedPiiLog, setSelectedPiiLog] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      content: `Welcome to VFS Global! I am your 24/7 AI Applicant Guidance Assistant. I can help verify your document requirements for ${destinationCountry}, explain compliance checks, or assist with 3D webcam biometrics. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: 'en',
      ragSources: [
        {
          id: 'src-init-01',
          title: 'Official Document Checklists & Statutory Compliance Rules',
          country: destinationCountry,
          statutoryArticle: 'VFS Global Applicant Standard 2026',
          snippet: 'All applicants must present valid passports, verified travel health insurance, and recent continuous financial statements.',
          relevanceScore: 0.98,
          category: 'checklist'
        }
      ]
    }
  ]);

  // Handle Proactive Discrepancy Notifications from Stage 3 IDP Engine
  useEffect(() => {
    if (flaggedDocuments.length > 0) {
      const flaggedDoc = flaggedDocuments[0];
      const proactiveMsg = generateProactiveIdpAlert(flaggedDoc, language);
      
      // Avoid duplicate alerts for the same doc
      setMessages(prev => {
        const exists = prev.some(m => m.proactiveTrigger?.docId === flaggedDoc.id);
        if (exists) return prev;

        // Broadcast proactive IDP intervention event to Admin Staff Dashboard
        realtimeSyncBus.publish({
          applicantRef,
          applicantName,
          destinationCountry,
          eventType: 'proactive_idp_alert',
          summary: `IDP Engine triggered proactive discrepancy guidance for ${flaggedDoc.title}.`,
          resolvedDiscrepancy: `Discrepancy: ${flaggedDoc.flagReason || 'Statutory validity date / minimum threshold variance'}`,
          fullMessage: proactiveMsg,
          severity: 'warning'
        });

        return [...prev, proactiveMsg];
      });

      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [flaggedDocuments, language, isOpen]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Setup Web Speech API for Speech-to-Text
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = LANGUAGE_LOCALES[language]?.bcp47 || 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsVoiceActive(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsVoiceActive(false);
      };

      recognition.onend = () => {
        setIsVoiceActive(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isVoiceActive) {
      recognitionRef.current.stop();
      setIsVoiceActive(false);
    } else {
      try {
        recognitionRef.current.lang = LANGUAGE_LOCALES[language]?.bcp47 || 'en-US';
        recognitionRef.current.start();
        setIsVoiceActive(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    setInputText('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language
    };

    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const botResponse = await processClientChatMessage(
        query,
        language,
        destinationCountry,
        currentStep
      );

      setMessages(prev => [...prev, botResponse]);

      // Stream applicant assistance interaction to Admin Queue via SSE Bus
      const isErrorFixQuery = query.toLowerCase().includes('insurance') || query.toLowerCase().includes('bank') || query.toLowerCase().includes('statement');
      realtimeSyncBus.publish({
        applicantRef,
        applicantName,
        destinationCountry,
        eventType: isErrorFixQuery ? 'auto_resolved_error' : 'chat_query',
        summary: `Applicant query on ${destinationCountry} requirements: "${query.length > 60 ? query.substring(0, 57) + '...' : query}"`,
        resolvedDiscrepancy: isErrorFixQuery ? 'AI Assistant validated statutory document criteria with applicant' : undefined,
        fullMessage: botResponse,
        severity: isErrorFixQuery ? 'resolved' : 'info'
      });

      if (isTtsEnabled) {
        playTextToSpeech(botResponse.content, language);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickChipClick = (chipText: string) => {
    handleSendMessage(chipText);
  };

  const handleOpenWidget = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
          {/* Proactive Floating Bubble if unread notifications exist */}
          {unreadCount > 0 && (
            <div 
              onClick={handleOpenWidget}
              className="bg-[#0A192F] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-[#FF9900]/40 flex items-center gap-2.5 cursor-pointer hover:bg-[#071324] transition-all animate-bounce"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9900] animate-ping" />
              <div className="text-xs">
                <span className="font-bold text-[#FF9900] block">VFS Guidance Notice</span>
                <span className="text-[11px] text-[#8892B0]">Document discrepancy advice ready</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenWidget}
            className="group relative p-4 rounded-2xl bg-[#0A192F] text-white shadow-2xl hover:bg-[#0066FF] transition-all duration-300 border border-white/20 flex items-center gap-3 cursor-pointer"
            aria-label="Open VFS AI Assistant"
          >
            <div className="relative">
              <Bot className="w-6 h-6 text-[#FF9900] group-hover:text-white transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF9900] text-[#0A192F] text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0A192F]">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white tracking-wide">VFS AI Assistant</div>
              <div className="text-[10px] text-[#8892B0] group-hover:text-white/80 font-mono">24/7 Applicant Support</div>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-[420px] h-[600px] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Top Header: Dark Blue/Navy (#0A192F) */}
          <div className="bg-[#0A192F] text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0066FF] text-white flex items-center justify-center font-bold shadow-xs">
                <Bot className="w-5 h-5 text-[#FF9900]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white tracking-tight">VFS Guidance Agent</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-[#8892B0] font-mono">
                  RAG Grounded · PII Masked · {destinationCountry}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Selector Dropdown */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono rounded-lg px-2 py-1 border border-white/15 outline-none cursor-pointer"
                >
                  {Object.entries(LANGUAGE_LOCALES).map(([code, meta]) => (
                    <option key={code} value={code} className="bg-[#0A192F] text-white">
                      {meta.flag} {meta.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* TTS Voice Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (isTtsEnabled) stopTextToSpeech();
                  setIsTtsEnabled(!isTtsEnabled);
                }}
                className={`p-1.5 rounded-lg border transition-all ${
                  isTtsEnabled ? 'bg-white/15 text-[#FF9900] border-white/20' : 'bg-transparent text-[#8892B0] border-transparent hover:bg-white/10'
                }`}
                title={isTtsEnabled ? 'Audio Speech Output: ON' : 'Audio Speech Output: OFF'}
              >
                {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  stopTextToSpeech();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Compliance Notice Banner */}
          <div className="px-3.5 py-1.5 bg-[#071324] text-[10px] text-[#8892B0] font-mono flex items-center justify-between border-b border-white/5 shrink-0">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PII Anonymization Layer Active</span>
            </span>
            <span className="text-white/60">Stage: {currentStep.toUpperCase()}</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant' || msg.sender === 'idp_proactive';
              const isProactive = msg.sender === 'idp_proactive';

              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} space-y-1.5`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#8892B0] font-mono px-1">
                    <span>{isAssistant ? 'VFS Assistant' : 'You'}</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div 
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isProactive
                        ? 'bg-[#FFF7ED] text-[#0A192F] border-2 border-[#FF9900]/60 shadow-xs'
                        : isAssistant
                        ? 'bg-[#F4F6F8] text-[#0A192F] border border-[#E2E8F0] shadow-xs'
                        : 'bg-[#0A192F] text-white'
                    }`}
                  >
                    {/* Proactive Discrepancy Header */}
                    {isProactive && (
                      <div className="flex items-center gap-1.5 font-bold text-[#0A192F] pb-2 mb-2 border-b border-[#FFD699] text-xs">
                        <AlertTriangle className="w-4 h-4 text-[#FF9900] shrink-0" />
                        <span>Stage 3 IDP Engine Flag</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Proactive Action Button (Orange / Gold #FF9900) */}
                    {msg.proactiveTrigger && (
                      <div className="mt-3 pt-2 border-t border-[#FFD699]/60 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onActionTrigger && msg.proactiveTrigger?.actionType) {
                              onActionTrigger(msg.proactiveTrigger.actionType, msg.proactiveTrigger.docId);
                            }
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <span>{msg.proactiveTrigger.actionLabel || 'Resolve Discrepancy'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Grounded RAG Citation Badge */}
                    {msg.ragSources && msg.ragSources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-gray-200/80 space-y-1">
                        <span className="text-[9px] font-mono text-[#8892B0] uppercase block">
                          Official Statutory Source:
                        </span>
                        {msg.ragSources.map((src) => (
                          <div key={src.id} className="bg-white/80 p-1.5 rounded border border-[#E2E8F0] text-[10px]">
                            <span className="font-bold text-[#0066FF]">{src.statutoryArticle}</span>
                            <p className="text-[#8892B0] text-[9px] mt-0.5">{src.snippet}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* PII Masked Log Inspector Link */}
                    {msg.piiMaskedLog && msg.piiMaskedLog.maskedEntities.length > 0 && (
                      <div className="mt-2 pt-1 border-t border-gray-200 text-[10px] font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPiiLog(msg.piiMaskedLog);
                            setShowPiiInspector(true);
                          }}
                          className="text-[#0066FF] hover:underline flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>View Sanitized PII Tokens ({msg.piiMaskedLog.maskedEntities.length})</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center gap-2 p-3 bg-[#F4F6F8] rounded-xl text-xs text-[#8892B0] font-mono w-fit animate-pulse border border-[#E2E8F0]">
                <Bot className="w-4 h-4 text-[#0066FF] animate-spin" />
                <span>Searching RAG vector index & sanitizing PII...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Chips */}
          <div className="px-3 py-2 bg-[#F4F6F8] border-t border-[#E2E8F0] flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
            <button
              type="button"
              onClick={() => handleQuickChipClick('What are the travel insurance rules for Schengen?')}
              className="px-2.5 py-1 bg-white hover:bg-gray-100 text-[#0A192F] rounded-lg border border-[#E2E8F0] whitespace-nowrap shadow-2xs font-medium"
            >
              🛡️ Insurance Rules (€30k)
            </button>
            <button
              type="button"
              onClick={() => handleQuickChipClick('How many months of bank statements do I need?')}
              className="px-2.5 py-1 bg-white hover:bg-gray-100 text-[#0A192F] rounded-lg border border-[#E2E8F0] whitespace-nowrap shadow-2xs font-medium"
            >
              📄 3-Month Bank PDF
            </button>
            <button
              type="button"
              onClick={() => handleQuickChipClick('Tips for webcam 3D liveness photo alignment?')}
              className="px-2.5 py-1 bg-white hover:bg-gray-100 text-[#0A192F] rounded-lg border border-[#E2E8F0] whitespace-nowrap shadow-2xs font-medium"
            >
              📷 Biometric Photo Specs
            </button>
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 bg-white border-t border-[#E2E8F0] shrink-0">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic STT Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-2.5 rounded-xl border transition-all ${
                  isVoiceActive 
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                    : 'bg-[#F4F6F8] hover:bg-gray-200 text-[#8892B0] border-[#E2E8F0]'
                }`}
                title={isVoiceActive ? 'Listening... Click to stop' : 'Click to speak (Voice STT)'}
              >
                {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isVoiceActive ? 'Listening to speech...' : 'Ask about documents, rules, or biometrics...'}
                className="flex-1 px-3 py-2 text-xs bg-[#F4F6F8] focus:bg-white text-[#0A192F] placeholder-[#8892B0] border border-[#E2E8F0] focus:border-[#0066FF] rounded-xl outline-none transition-all"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isThinking}
                className="p-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-40 text-white font-bold transition-all shadow-xs cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* PII Anonymization Modal Dialog */}
          {showPiiInspector && selectedPiiLog && (
            <div className="absolute inset-0 bg-[#0A192F]/90 backdrop-blur-xs z-50 p-5 flex flex-col justify-between text-white animate-in fade-in duration-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      PII Masking & Privacy Shield Log
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPiiInspector(false)}
                    className="text-[#8892B0] hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-[#8892B0]">
                  Before your prompt was sent to the Large Language Model, our anonymization middleware sanitized the following sensitive entities:
                </p>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedPiiLog.maskedEntities.map((ent: any, idx: number) => (
                    <div key={idx} className="bg-[#071324] p-2.5 rounded-xl border border-white/10 text-xs font-mono">
                      <div className="flex justify-between text-[10px] text-[#8892B0]">
                        <span className="text-emerald-400 font-bold">{ent.type} DETECTED</span>
                        <span>Tokenized</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-white/60">Masked Value: <strong>{ent.originalValueMasked}</strong></span>
                        <span className="text-[#FF9900] bg-[#FF9900]/10 px-1.5 py-0.5 rounded font-bold">
                          {ent.token}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPiiInspector(false)}
                className="w-full py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold rounded-xl transition-all font-mono"
              >
                Close Privacy Inspector
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
