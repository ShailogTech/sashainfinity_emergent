import React from 'react'
import { motion } from 'framer-motion'
const cats=[{icon:'🚀',name:'Meiporul',count:'06 Courses',href:'https://sashainfinity.com/meiporul-ar/'},{icon:'☀️',name:'Seyappaduporul',count:'08 Courses',href:'#'},{icon:'💡',name:'Utporul',count:'13 Courses',href:'#'}]
export default function CategoriesSection() {
  return (
    <section id="categories" style={{padding:'120px 0',background:'linear-gradient(180deg,#fafafa 0%,#fff 100%)'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 48px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:60,alignItems:'start'}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:10,color:'#f4911a',fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',marginBottom:16,fontFamily:"'Inter',sans-serif"}}>
              <div style={{width:28,height:2,background:'#f4911a',borderRadius:2}}/>Unique Online Courses
            </div>
            <h2 style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:42,fontWeight:800,color:'#1a1a2e',letterSpacing:'-1.5px',lineHeight:1.15,marginBottom:24}}>Browse By<br/>Categories</h2>
            <motion.a href="/courses" whileHover={{y:-2}} style={{display:'inline-flex',alignItems:'center',gap:8,background:'#f4911a',color:'#fff',textDecoration:'none',borderRadius:12,padding:'14px 28px',fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:700}}>All Categories →</motion.a>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {cats.map((cat,i)=>(
              <motion.a key={i} href={cat.href} initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.12}}
                whileHover={{y:-8,boxShadow:'0 20px 60px rgba(0,0,0,0.1)',borderColor:'rgba(244,145,26,0.4)'}}
                style={{background:'rgba(255,255,255,0.8)',border:'1px solid rgba(0,0,0,0.06)',borderRadius:20,padding:'36px 20px',textAlign:'center',textDecoration:'none',display:'block',transition:'all 0.4s'}}>
                <div style={{width:68,height:68,borderRadius:18,background:'rgba(244,145,26,0.08)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:28,marginBottom:16}}>{cat.icon}</div>
                <h3 style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:18,fontWeight:700,color:'#1a1a2e',marginBottom:6}}>{cat.name}</h3>
                <span style={{fontSize:13,color:'#6b7280',fontFamily:"'Inter',sans-serif"}}>{cat.count}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
