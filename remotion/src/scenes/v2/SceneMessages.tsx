import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

const convos = [
  { name: "Groupe Bacc SMP", last: "Wilkenson tape…", unread: 3, color: COLORS.teal, initials: "G" },
  { name: "Naïka Pierre", last: "Tu viens réviser ce soir ?", unread: 1, color: COLORS.violet, initials: "NP" },
  { name: "Jude · IA", last: "On finit l'exo ensemble ? 🤖", unread: 0, color: COLORS.amber, initials: "J" },
  { name: "Sabine Dorléans", last: "Merci pour les notes !", unread: 0, color: COLORS.green, initials: "SD" },
];

const initialBubbles = [
  { from: "them", text: "Salut les amis 👋 qui est chaud pour réviser la physique ?", t: "14:32" },
  { from: "me", text: "Moi ! J'ai pas trop pigé les ondes mécaniques 😅", t: "14:33" },
  { from: "them", text: "Pareil. Jude peut nous faire un récap ?", t: "14:33" },
];

// Scene 9 (6s / 180f): Messages — sidebar + active chat with live bubbles + typing.
export const SceneMessages: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Typing indicator appears at frame 60, new message at frame 95, my reply at 135
  const showTyping = frame > 60 && frame < 95;
  const newMsgP = frame > 95 ? spring({ frame: frame - 95, fps, config: { damping: 14, stiffness: 220 } }) : 0;
  const myReplyP = frame > 135 ? spring({ frame: frame - 135, fps, config: { damping: 14, stiffness: 220 } }) : 0;
  const typingDots = Math.floor((frame - 60) / 8) % 3;

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: 60 }}>
      <Flash />
      <div style={{ display: "flex", gap: 24, height: "100%" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 380,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 24,
            padding: 20,
          }}
        >
          <div style={{ color: COLORS.text, fontSize: 28, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Messages
          </div>
          <div
            style={{
              padding: "10px 14px",
              background: COLORS.surfaceElev,
              borderRadius: 10,
              color: COLORS.textMuted,
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            🔍 Rechercher…
          </div>
          {convos.map((c, i) => {
            const p = spring({ frame: frame - i * 5, fps, config: { damping: 18, stiffness: 200 } });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 14,
                  background: i === 0 ? COLORS.surfaceElev : "transparent",
                  marginBottom: 6,
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [-20, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: c.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {c.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: COLORS.text, fontSize: 15, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ color: COLORS.textMuted, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.last}
                  </div>
                </div>
                {c.unread > 0 && (
                  <div
                    style={{
                      minWidth: 22,
                      height: 22,
                      borderRadius: 11,
                      background: COLORS.amber,
                      color: "#0A0B0D",
                      fontSize: 12,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 6px",
                    }}
                  >
                    {c.unread}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active chat */}
        <div
          style={{
            flex: 1,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 24,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Chat header */}
          <div style={{ padding: 20, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: COLORS.teal,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              G
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800 }}>Groupe Bacc SMP</div>
              <div style={{ color: COLORS.green, fontSize: 13 }}>● 8 membres en ligne</div>
            </div>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, padding: 28, display: "flex", flexDirection: "column", gap: 14, justifyContent: "flex-end" }}>
            {initialBubbles.map((b, i) => {
              const p = spring({ frame: frame - i * 6, fps, config: { damping: 18, stiffness: 200 } });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: b.from === "me" ? "flex-end" : "flex-start",
                    opacity: p,
                    transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      maxWidth: 520,
                      padding: "12px 18px",
                      borderRadius: b.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: b.from === "me" ? COLORS.teal : COLORS.surfaceElev,
                      color: b.from === "me" ? "#fff" : COLORS.text,
                      fontSize: 16,
                      lineHeight: 1.5,
                      border: b.from === "me" ? "none" : `1px solid ${COLORS.border}`,
                    }}
                  >
                    {b.text}
                    <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{b.t}</div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {showTyping && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "16px 22px",
                    background: COLORS.surfaceElev,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "18px 18px 18px 4px",
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: COLORS.textMuted,
                        opacity: typingDots === i ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Incoming new bubble */}
            {newMsgP > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-start", opacity: newMsgP, transform: `translateY(${interpolate(newMsgP, [0, 1], [20, 0])}px)` }}>
                <div
                  style={{
                    maxWidth: 520,
                    padding: "12px 18px",
                    borderRadius: "18px 18px 18px 4px",
                    background: COLORS.surfaceElev,
                    border: `1px solid ${COLORS.amber}`,
                    color: COLORS.text,
                    fontSize: 16,
                    lineHeight: 1.5,
                    boxShadow: `0 8px 30px ${COLORS.amber}33`,
                  }}
                >
                  Carrément ! Je l'invite dans le chat 🤖
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>14:34</div>
                </div>
              </div>
            )}

            {/* My reply */}
            {myReplyP > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", opacity: myReplyP, transform: `translateY(${interpolate(myReplyP, [0, 1], [20, 0])}px)` }}>
                <div
                  style={{
                    maxWidth: 520,
                    padding: "12px 18px",
                    borderRadius: "18px 18px 4px 18px",
                    background: COLORS.teal,
                    color: "#fff",
                    fontSize: 16,
                    lineHeight: 1.5,
                  }}
                >
                  Let's go 🚀
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>14:34</div>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div style={{ padding: 18, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10 }}>
            <div style={{ flex: 1, padding: "12px 16px", background: COLORS.surfaceElev, borderRadius: 12, color: COLORS.textMuted, fontSize: 15 }}>
              Écris un message…
            </div>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: COLORS.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              ➤
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
