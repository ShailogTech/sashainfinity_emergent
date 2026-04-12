import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
const slides=[
  {text:'Hi, this is Annamalai Venkatachalam. I have completed the Sasha Infinity course, which had excellent content and wonderful teaching methods.',name:'Annamalai Venkatachalam',role:'Student'},
  {text:'I am very satisfied with this course. Topics are very clear and the teaching methodology is excellent.',name:'Durkka P',role:'Student'},
  {text:"My daughter's math scores have improved dramatically since she started using SashaInfinity.",name:'Priya Krishnaswamy',role:'Parent'},
  {text:'The analytics course gave me practical understanding that helped me land my first internship.',name:'Rajan Subramaniam',role:'College Student'},
]
export default function TestimonialsSection() {
  const [idx,setIdx]=useState(0)
  useEffect(()=>{const t=setInterval(()=>setIdx(i=>(i+1)%slides.length),6000);return()=>clearInterval(t)},[])
  return (
    <section style={{padding:'120px 0',background:'#fff',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:800,height:800,background:'radial-gradient(circle,rgba(244,145,26,0.04) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 48px'}}>
        <div style={{textAlign:'center',marginBottom:60}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:10,color:'#f4911a',fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',marginBottom:16,fontFamily:"'Inter',sans-serif"}}>
            <div style={{width:28,height:2,background:'#f4911a',borderRadius:2}}/>Testimonials<div style={{width:28,height:2,background:'#f4911a',borderRadius:2}}/>
          </div>
          <h2 style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:42,fontWeight:800,color:'#1a1a2e',letterSpacing:'-1.5px'}}>What Students Say</h2>
        </div>
        <div style={{maxWidth:680,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:56,color:'rgba(244,145,26,0.15)',marginBottom:24,fontFamily:'Georgia,serif',lineHeight:1}}>"</div>
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.4}}>
              <div style={{display:'flex',justifyContent:'center',gap:4,marginBottom:20,color:'#f4911a',fontSize:18}}>★★★★★</div>
              <p style={{fontSize:20,lineHeight:1.7,color:'#374151',fontStyle:'italic',marginBottom:28,fontFamily:"'Inter',sans-serif"}}>"{slides[idx].text}"</p>
              <div style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:16,fontWeight:700,color:'#1a1a2e'}}>{slides[idx].name}</div>
              <div style={{fontSize:13,color:'#6b7280',marginTop:4,fontFamily:"'Inter',sans-serif"}}>{slides[idx].role}</div>
            </motion.div>
          </AnimatePresence>
          <div style={{display:'flex',justifyContent:'center',gap:12,marginTop:36}}>
            {['←','→'].map((a,i)=>(
              <button key={i} onClick={()=>setIdx(j=>i===0?(j-1+slides.length)%slides.length:(j+1)%slides.length)}
                style={{width:46,height:46,borderRadius:'50%',border:'1px solid rgba(0,0,0,0.1)',background:'transparent',cursor:'pointer',fontSize:16,color:'#6b7280',transition:'all 0.3s'}}
                onMouseEnter={e=>{const t=e.target as HTMLButtonElement;t.style.borderColor='#f4911a';t.style.color='#f4911a'}}
                onMouseLeave={e=>{const t=e.target as HTMLButtonElement;t.style.borderColor='rgba(0,0,0,0.1)';t.style.color='#6b7280'}}>{a}</button>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:20}}>
            {slides.map((_,i)=>(<div key={i} onClick={()=>setIdx(i)} style={{cursor:'pointer',width:i===idx?24:8,height:8,borderRadius:4,background:i===idx?'#f4911a':'rgba(0,0,0,0.12)',transition:'all 0.3s'}}/>))}
          </div>
        </div>
      </div>
    </section>
  )
}
