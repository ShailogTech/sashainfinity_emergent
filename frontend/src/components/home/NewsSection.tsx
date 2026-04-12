import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface WPPost {
  id: number
  title: { rendered: string }
  excerpt: { rendered: string }
  link: string
  date: string
  _embedded?: any
}

const gradients = [
  'linear-gradient(135deg,#667EEA,#764BA2)',
  'linear-gradient(135deg,#F093FB,#F5576C)',
  'linear-gradient(135deg,#4FACFE,#00F2FE)',
]
const icons = ['∑','∞','α']

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g,'').replace(/&[^;]+;/g,' ').trim().slice(0,120) + '...'
}

export default function NewsSection() {
  const [posts, setPosts] = useState<WPPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://sashainfinity.com/wp-json/wp/v2/posts?per_page=3&_embed')
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const fallbackPosts = [
    {id:1,title:{rendered:'Modulus of a Complex Number'},excerpt:{rendered:'Explore how the modulus represents a complex number distance from the origin in the complex plane.'},link:'/blog/modulus-of-a-complex-number',date:'2025-11-21'},
    {id:2,title:{rendered:'Conjugate of a Complex Number'},excerpt:{rendered:'Understanding conjugates and their applications in simplifying expressions and solving equations.'},link:'/blog/conjugate-of-a-complex-number',date:'2025-11-21'},
    {id:3,title:{rendered:'Basic Algebraic Properties of Complex Numbers'},excerpt:{rendered:'A deep dive into the fundamental algebraic properties governing complex number arithmetic.'},link:'/blog/basic-algebraic-properties-of-complex-numbers',date:'2025-11-21'},
  ]

  const displayPosts = posts.length > 0 ? posts : fallbackPosts

  return (
    <section id="blog" style={{padding:'120px 0',background:'#fafafa'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 48px'}}>
        <div style={{textAlign:'center',maxWidth:600,margin:'0 auto 72px'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:10,color:'#f4911a',fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',marginBottom:16,fontFamily:"'Inter',sans-serif"}}>
            <div style={{width:28,height:2,background:'#f4911a',borderRadius:2}}/>Always Smart To Hear News
          </div>
          <h2 style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:42,fontWeight:800,color:'#1a1a2e',letterSpacing:'-1.5px',lineHeight:1.15}}>Latest News & Blog</h2>
        </div>
        {loading ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {[1,2,3].map(i => (
              <div key={i} style={{background:'#fff',borderRadius:20,overflow:'hidden',border:'1px solid rgba(0,0,0,0.06)'}}>
                <div style={{height:200,background:'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)',animation:'shimmer 1.5s infinite'}}/>
                <div style={{padding:24}}>
                  <div style={{height:12,background:'#f0f0f0',borderRadius:6,marginBottom:12,width:'60%'}}/>
                  <div style={{height:20,background:'#f0f0f0',borderRadius:6,marginBottom:8}}/>
                  <div style={{height:16,background:'#f0f0f0',borderRadius:6,width:'80%'}}/>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {displayPosts.slice(0,3).map((p,i) => {
              const featImg = p._embedded?.['wp:featuredmedia']?.[0]?.source_url
              const date = new Date(p.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
              return (
                <motion.a key={p.id} href={p.link.startsWith("/blog/") ? p.link : "/blog/" + p.link.replace(/https?:\/\/[^\/]+\/(?:blog\/)?/, "").replace(/\/$/, "")}
                  initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.12}}
                  whileHover={{y:-6,boxShadow:'0 16px 48px rgba(0,0,0,0.1)'}}
                  style={{background:'#fff',border:'1px solid rgba(0,0,0,0.06)',borderRadius:20,overflow:'hidden',textDecoration:'none',display:'block',transition:'all 0.4s'}}>
                  <div style={{height:200,background:featImg?'#f0f0f0':gradients[i%3],display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                    {featImg ? (
                      <img src={featImg} alt={p.title.rendered} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                    ) : (
                      <span style={{fontSize:56,color:'rgba(255,255,255,0.5)',fontFamily:'Georgia,serif'}}>{icons[i%3]}</span>
                    )}
                  </div>
                  <div style={{padding:24}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                      <span style={{background:'rgba(244,145,26,0.08)',color:'#f4911a',padding:'4px 12px',borderRadius:6,fontSize:11,fontWeight:700,textTransform:'uppercase',fontFamily:"'Inter',sans-serif"}}>Mathematics</span>
                      <span style={{fontSize:12,color:'#9ca3af',fontFamily:"'Inter',sans-serif"}}>{date}</span>
                    </div>
                    <h4 style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:17,fontWeight:700,color:'#1a1a2e',lineHeight:1.4,marginBottom:10}} dangerouslySetInnerHTML={{__html:p.title.rendered}}/>
                    <p style={{fontSize:13,color:'#9ca3af',lineHeight:1.7,marginBottom:16,fontFamily:"'Inter',sans-serif"}}>{stripHtml(p.excerpt.rendered)}</p>
                    <div style={{borderTop:'1px solid rgba(0,0,0,0.05)',paddingTop:16,textAlign:'right'}}>
                      <span style={{fontSize:13,color:'#f4911a',fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Read More →</span>
                    </div>
                  </div>
                </motion.a>
              )
            })}
          </div>
        )}
        <style>{'@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}'}</style>
      </div>
    </section>
  )
}
