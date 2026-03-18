"use client";
import { useState, useRef, useEffect } from "react";

const CATEGORIES = [
  { id: "relationship", label: "Relationship", emoji: "💔", color: "#E8474C" },
  { id: "workplace", label: "Workplace", emoji: "💼", color: "#4A7FBF" },
  { id: "money", label: "Money", emoji: "💸", color: "#2DA86E" },
  { id: "legal", label: "Legal", emoji: "⚖️", color: "#8B6FD4" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧", color: "#E8953A" },
];

const EXAMPLES = [
  "My roommate hasn't paid rent in 2 months but keeps buying new stuff. I've asked 3 times. Should I give an ultimatum?",
  "My manager took credit for my project in a meeting with the CEO. I have emails proving it was my work. What do I do?",
  "I lent my brother $4,000 six months ago. He's been avoiding me. He just posted photos of a vacation on Instagram.",
];

export default function Home() {
  const [category, setCategory] = useState("relationship");
  const [situation, setSituation] = useState("");
  const [response, setResponse] = useState("");
  const [verdictData, setVerdictData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const responseRef = useRef(null);

  const handleSubmit = async () => {
    if (!situation.trim() || loading) return;
    setLoading(true);
    setResponse("");
    setVerdictData(null);
    setShowCard(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, situation }),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      let fullText = "";
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                const displayText = fullText.replace(/<verdict_data>[\s\S]*?<\/verdict_data>/g, "").trim();
                setResponse(displayText);
              }
            } catch {}
          }
        }
      }
      const match = fullText.match(/<verdict_data>([\s\S]*?)<\/verdict_data>/);
      if (match) {
        try {
          const parsed = JSON.parse(match[1].trim());
          setVerdictData(parsed);
          setTimeout(() => setShowCard(true), 300);
        } catch {}
      }
    } catch {
      setResponse("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (response && responseRef.current) {
      (responseRef.current as any).scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [response]);

  const selectedCat = CATEGORIES.find((c) => c.id === category)!;

  return (
    <main style={{maxWidth:860,margin:"0 auto",padding:"0 20px",fontFamily:"system-ui,sans-serif",background:"#0A0A0A",minHeight:"100vh",color:"#F0EDE8"}}>
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 0",borderBottom:"1px solid rgba(255,255,255,0.08)",position:"sticky",top:0,background:"rgba(10,10,10,0.95)",zIndex:100}}>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.02em"}}>
          <span>Real</span><span style={{color:"#E8474C"}}>Talk</span><span style={{color:"#888",fontWeight:400}}>AI</span>
        </div>
      </header>

      <section style={{padding:"80px 0 60px",textAlign:"center"}}>
        <div style={{fontSize:13,letterSpacing:"0.1em",textTransform:"uppercase",color:"#888",marginBottom:20}}>No sugarcoating. No therapy-speak. Just the truth.</div>
        <h1 style={{fontSize:"clamp(36px,6vw,64px)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.03em",marginBottom:20}}>
          Finally, an AI that tells you<br/><span style={{color:"#E8474C"}}>what you actually need to hear.</span>
        </h1>
        <p style={{fontSize:18,color:"#888",maxWidth:560,margin:"0 auto 32px",fontWeight:300}}>
          Describe your situation. Get a brutally honest analysis, a clear verdict, and a real action plan — in under 30 seconds.
        </p>
      </section>

      <section style={{paddingBottom:80}}>
        <div style={{background:"#141414",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:32,marginBottom:20}}>
          <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:"0.08em",color:"#888",marginBottom:12}}>What kind of situation?</div>
          <div style={{display:"flex",flexWrap:"wrap" as const,gap:8,marginBottom:24}}>
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:100,border:`1px solid ${category===cat.id?cat.color:"rgba(255,255,255,0.08)"}`,background:category===cat.id?cat.color+"22":"transparent",color:category===cat.id?cat.color:"#888",fontSize:14,cursor:"pointer",transition:"all 0.15s"}}>
                <span>{cat.emoji}</span>{cat.label}
              </button>
            ))}
          </div>
          <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:"0.08em",color:"#888",marginBottom:10}}>Tell me what happened</div>
          <textarea
            style={{width:"100%",background:"#1C1C1C",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:16,color:"#F0EDE8",fontFamily:"system-ui,sans-serif",fontSize:15,lineHeight:1.6,resize:"vertical" as const,boxSizing:"border-box" as const}}
            placeholder="Be specific. The more detail, the better the analysis..."
            value={situation} onChange={(e) => setSituation(e.target.value)} rows={5}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8,marginBottom:0}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:"#555"}}>Examples:</span>
              {EXAMPLES.map((ex,i) => (
                <button key={i} onClick={() => setSituation(ex)} style={{fontSize:12,color:"#888",background:"#1C1C1C",border:"1px solid rgba(255,255,255,0.08)",padding:"3px 10px",borderRadius:100,cursor:"pointer"}}>#{i+1}</button>
              ))}
            </div>
            <span style={{fontSize:12,color:"#555"}}>{situation.length} chars</span>
          </div>
          <button onClick={handleSubmit} disabled={loading||!situation.trim()}
            style={{width:"100%",marginTop:20,padding:16,background:"#E8474C",color:"white",border:"none",borderRadius:12,fontSize:16,fontWeight:500,cursor:loading||!situation.trim()?"not-allowed":"pointer",opacity:loading||!situation.trim()?0.5:1}}>
            {loading ? "Analyzing your situation..." : "Get the Real Talk →"}
          </button>
        </div>

        {(response||loading) && (
          <div ref={responseRef} style={{display:"flex",flexDirection:"column" as const,gap:16}}>
            {verdictData && showCard && (
              <div style={{background:"#141414",border:`1px solid ${selectedCat.color}`,borderRadius:20,padding:28}}>
                <div style={{display:"inline-block",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase" as const,padding:"4px 12px",borderRadius:100,marginBottom:10,background:selectedCat.color+"22",color:selectedCat.color,border:`1px solid ${selectedCat.color}44`}}>
                  {(verdictData as any).verdict_label}
                </div>
                <div style={{fontSize:24,fontWeight:700,lineHeight:1.2,letterSpacing:"-0.02em",marginBottom:20}}>{(verdictData as any).verdict_headline}</div>
                <div style={{display:"flex",background:"#1C1C1C",borderRadius:12,overflow:"hidden",marginBottom:20}}>
                  <div style={{flex:1,padding:16,textAlign:"center" as const}}>
                    <div style={{fontSize:36,fontWeight:800,color:selectedCat.color}}>{(verdictData as any).user_score}%</div>
                    <div style={{fontSize:12,color:"#888",marginTop:4,textTransform:"uppercase" as const,letterSpacing:"0.06em"}}>on you</div>
                  </div>
                  <div style={{width:1,background:"rgba(255,255,255,0.08)"}}/>
                  <div style={{flex:1,padding:16,textAlign:"center" as const}}>
                    <div style={{fontSize:36,fontWeight:800,color:selectedCat.color}}>{(verdictData as any).other_score}%</div>
                    <div style={{fontSize:12,color:"#888",marginTop:4,textTransform:"uppercase" as const,letterSpacing:"0.06em"}}>on them</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column" as const,gap:8,marginBottom:20}}>
                  <div style={{display:"flex",gap:10,fontSize:14,color:"#888"}}>💡 {(verdictData as any).key_insight}</div>
                  <div style={{display:"flex",gap:10,fontSize:14,color:"#888"}}>→ {(verdictData as any).action}</div>
                </div>
                <button style={{width:"100%",padding:12,background:"transparent",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,color:"#888",fontSize:13,cursor:"pointer"}}>
                  Share your verdict ↗
                </button>
              </div>
            )}
            <div style={{background:"#141414",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:28}}>
              <div style={{fontSize:12,textTransform:"uppercase" as const,letterSpacing:"0.08em",color:"#888",marginBottom:16}}>{selectedCat.emoji} {selectedCat.label} analysis</div>
              <div style={{fontSize:15,lineHeight:1.8,color:"#F0EDE8"}}>
                {response.split("\n").map((line,i) => line.trim() ? <p key={i} style={{marginBottom:12}}>{line.replace(/\*\*/g,"")}</p> : <br key={i}/>)}
                {loading && !response && <span style={{animation:"blink 1s infinite"}}>|</span>}
              </div>
            </div>
          </div>
        )}
      </section>

      <footer style={{padding:"40px 0",borderTop:"1px solid rgba(255,255,255,0.08)",textAlign:"center" as const,color:"#555",fontSize:12}}>
        <div style={{marginBottom:8,fontWeight:700,color:"#888"}}>Real Talk AI</div>
        Real Talk AI provides general information only and does not constitute legal, medical, or financial advice.
      </footer>
    </main>
  );
}
