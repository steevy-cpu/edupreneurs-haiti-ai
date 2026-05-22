import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash, Cursor } from "../../components/Flash";

const posts = [
  {
    name: "Naïka P.",
    handle: "naika.ns4",
    grade: "NS4",
    initials: "NP",
    color: COLORS.violet,
    time: "il y a 5 min",
    content: "Quizz d'histoire enfin réussi à 95% 🎉 Merci à @jude pour les fiches récap !",
    likes: 47,
    comments: 12,
  },
  {
    name: "Wilkenson J.",
    handle: "wilk.smp",
    grade: "NS4 · SMP",
    initials: "WJ",
    color: COLORS.teal,
    time: "il y a 18 min",
    content: "Qui veut former un groupe de révision pour la physique du Bacc cette semaine ? On se retrouve dans Messages 💬",
    likes: 23,
    comments: 8,
  },
  {
    name: "Sabine D.",
    handle: "sabine.9af",
    grade: "9AF",
    initials: "SD",
    color: COLORS.amber,
    time: "il y a 42 min",
    content: "Première leçon de programmation Python aujourd'hui, j'adore ! 🐍 Edupreneurs change vraiment la donne.",
    likes: 89,
    comments: 24,
  },
];

const Post: React.FC<{ p: typeof posts[0]; delay: number; highlight?: boolean; liked?: boolean }> = ({
  p,
  delay,
  highlight,
  liked,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 200 } });
  const likeBump = liked && frame > 110 ? spring({ frame: frame - 110, fps, config: { damping: 8, stiffness: 250 } }) : 0;
  const likes = liked && frame > 110 ? p.likes + 1 : p.likes;

  return (
    <div
      style={{
        background: COLORS.surface,
        border: highlight ? `1px solid ${COLORS.amber}` : `1px solid ${COLORS.border}`,
        borderRadius: 20,
        padding: 24,
        opacity: sp,
        transform: `translateY(${interpolate(sp, [0, 1], [40, 0])}px)`,
        boxShadow: highlight ? `0 20px 60px ${COLORS.amber}33` : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: p.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 16,
          }}
        >
          {p.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ color: COLORS.text, fontSize: 17, fontWeight: 700 }}>{p.name}</div>
            <div
              style={{
                padding: "2px 8px",
                background: `${COLORS.teal}33`,
                color: COLORS.tealGlow,
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              {p.grade}
            </div>
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: 13 }}>@{p.handle} · {p.time}</div>
        </div>
      </div>
      <div style={{ color: COLORS.text, fontSize: 17, lineHeight: 1.55, marginBottom: 14 }}>{p.content}</div>
      <div style={{ display: "flex", gap: 28, color: COLORS.textMuted, fontSize: 14, fontWeight: 600 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: liked && frame > 110 ? COLORS.amber : COLORS.textMuted, transform: `scale(${1 + likeBump * 0.4})`, transformOrigin: "left center" }}>
          {liked && frame > 110 ? "❤" : "♡"} {likes}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>💬 {p.comments}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>🔁 Partager</div>
      </div>
    </div>
  );
};

// Scene 8 (6s / 180f): Community feed with likes/comments emphasis.
export const SceneFeed: React.FC = () => {
  const frame = useCurrentFrame();
  const titleP = spring({ frame, fps: 30, config: { damping: 18, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: "50px 60px" }}>
      <Flash />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24, opacity: titleP }}>
        <div>
          <div style={{ color: COLORS.amber, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 700 }}>
            Communauté · Fil
          </div>
          <div style={{ color: COLORS.text, fontSize: 56, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Tu n'études pas seul·e.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", color: COLORS.green, fontWeight: 700, fontSize: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.green, boxShadow: `0 0 10px ${COLORS.green}` }} />
          1 248 élèves en ligne
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18, maxWidth: 900, margin: "0 auto" }}>
        <Post p={posts[0]} delay={20} />
        <Post p={posts[1]} delay={50} highlight liked />
        <Post p={posts[2]} delay={80} />
      </div>

      <Cursor fromX={1500} fromY={900} toX={620} toY={560} startFrame={85} durationFrames={20} clickAt={110} />
    </AbsoluteFill>
  );
};
