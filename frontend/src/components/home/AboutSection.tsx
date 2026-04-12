import React, { useState } from 'react'
import { motion } from 'framer-motion'

const morphPhrases = ['The Place Where You Can Achieve','Immersive AR/VR Learning','Personalized Education','Data-Driven Learning Paths','Hybrid Tutoring Centers']

function MorphText() {
  const [idx, setIdx] = React.useState(0)
  const [blur, setBlur] = React.useState(false)
  React.useEffect(() => {
    const t = setInterval(() => { setBlur(true); setTimeout(() => { setIdx(i=>(i+1)%morphPhrases.length); setBlur(false) }, 700) }, 3500)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{minHeight:56,marginBottom:20}}>
      <div style={{transition:'all 0.7s',opacity:blur?0:1,filter:blur?'blur(6px)':'none',fontFamily:"'Lexend Deca',sans-serif",fontSize:'clamp(20px,2.5vw,32px)',fontWeight:800,color:'#1a1a2e',lineHeight:1.2}}>
        {morphPhrases[idx]}
      </div>
    </div>
  )
}

const features=[
  {icon:'🥽',text:'Immersive AR/VR Math Learning'},
  {icon:'🧠',text:'Personalized Interactive Quizzes'},
  {icon:'🏫',text:'Hybrid Tutoring Centers'},
  {icon:'📊',text:'Analytics Courses for Everyone'},
  {icon:'🗺️',text:'Custom Learning Paths'},
]
const stats=[
  {icon:'🎧',s:'5+ Expert Tutors',sub:'Dedicated mentors'},
  {icon:'📄',s:'70+ Top Lessons',sub:'Quality content'},
  {icon:'🎓',s:'50+ Students',sub:'And growing'},
  {icon:'🎬',s:'100+ Pro Videos',sub:'Learn anywhere'},
]

export default function AboutSection() {
  const [imgError, setImgError] = useState(false)
  return (
    <section id="about" style={{padding:'120px 0',background:'#fff'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 48px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
          <motion.div initial={{opacity:0,x:-40}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>
            <div style={{position:'relative',borderRadius:24,overflow:'hidden',background:'linear-gradient(135deg,rgba(253,224,71,0.15),rgba(244,114,182,0.1))',border:'1px solid rgba(0,0,0,0.06)',padding:32}}>
              <div style={{position:'absolute',top:20,left:20,background:'#f4911a',color:'#fff',borderRadius:16,padding:'12px 16px',textAlign:'center',zIndex:2,boxShadow:'0 8px 24px rgba(244,145,26,0.3)'}}>
                <div style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:28,fontWeight:800}}>2+</div>
                <div style={{fontSize:12,fontWeight:600}}>Years</div>
              </div>
              {!imgError ? (
                <img
                  src="/about-child.png"
                  alt="About SashaInfinity"
                  onError={() => setImgError(true)}
                  style={{width:'100%',borderRadius:16,display:'block',minHeight:200}}
                />
              ) : (
                <div style={{width:'100%',height:280,borderRadius:16,background:'linear-gradient(135deg,#f4911a,#ffaa44)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:80}}>
                  🎓
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:24,textAlign:'center' as const,justifyItems:'center'}}>
                {stats.map((s,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:44,height:44,borderRadius:12,background:'rgba(244,145,26,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{s.icon}</div>
                    <div>
                      <strong style={{display:'block',color:'#1a1a2e',fontSize:13,fontWeight:700,fontFamily:"'Lexend Deca',sans-serif"}}>{s.s}</strong>
                      <span style={{fontSize:11,color:'#6b7280',fontFamily:"'Inter',sans-serif"}}>{s.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div initial={{opacity:0,x:40}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:10,color:'#f4911a',fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',marginBottom:16,fontFamily:"'Inter',sans-serif"}}>
              <div style={{width:28,height:2,background:'#f4911a',borderRadius:2}}/>Get To Know About Us
            </div>
            <MorphText/>
            <p style={{fontSize:15,color:'#6b7280',lineHeight:1.8,marginBottom:12,fontFamily:"'Inter',sans-serif"}}>Sashainfinity is a pioneering EdTech Company transforming mathematics education for students in tier 2 and tier 3 cities. With cutting-edge AR/VR integration, hybrid tutoring centers and analytics courses.</p>
            <p style={{fontSize:15,color:'#6b7280',lineHeight:1.8,marginBottom:24,fontFamily:"'Inter',sans-serif"}}>Personalized Tutoring by using customized and dedicated LMS module to actively engage students with quizzes and engaging content.</p>
            <ul style={{listStyle:'none',padding:0,display:'grid',gap:12,marginBottom:28}}>
              {features.map((f,i) => (
                <motion.li key={i} initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.08}}
                  style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'rgba(244,145,26,0.08)',border:'1px solid rgba(244,145,26,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:16}}>{f.icon}</div>
                  <span style={{fontSize:14,color:'#374151',fontWeight:500,fontFamily:"'Inter',sans-serif"}}>{f.text}</span>
                </motion.li>
              ))}
            </ul>
            <motion.a href="/about" whileHover={{y:-2,boxShadow:'0 8px 24px rgba(244,145,26,0.25)'}}
              style={{display:'inline-flex',alignItems:'center',gap:8,background:'#f4911a',color:'#fff',textDecoration:'none',borderRadius:12,padding:'15px 30px',fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:700}}>
              Discover More →
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
