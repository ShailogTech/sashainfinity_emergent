import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/axios'

const team = [
  {init:'M',role:'Math Specialist',name:'Mathematics Lead',grad:'linear-gradient(135deg,#667EEA,#764BA2)',img:''},
  {init:'T',role:'AR/VR Expert',name:'Tech Lead',grad:'linear-gradient(135deg,#f093fb,#f5576c)',img:''},
  {init:'A',role:'Digital Marketer',name:'Analytics Mentor',grad:'linear-gradient(135deg,#4facfe,#00f2fe)',img:''},
  {init:'S',role:'Support Staff',name:'Student Coordinator',grad:'linear-gradient(135deg,#43e97b,#38f9d7)',img:''},
]

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [msg, setMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) { setMsg('Please enter a valid email'); setStatus('error'); return }
    setStatus('loading')
    try {
      await api.post('/blog/newsletter/subscribe', { email })
      setStatus('success'); setMsg('Subscribed successfully! Check your inbox.'); setEmail('')
    } catch (err: any) {
      setStatus('error'); setMsg(err.response?.data?.detail || 'Failed to subscribe. Please try again.')
    }
  }

  return (
    <section style={{padding:'70px 0',background:'#fafafa',borderTop:'1px solid rgba(0,0,0,0.05)'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 48px',textAlign:'center'}}>
        <h3 style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:28,fontWeight:800,color:'#1a1a2e',letterSpacing:'-1px',marginBottom:12}}>Let's Join To Our Newsletters</h3>
        <p style={{fontSize:15,color:'#6b7280',marginBottom:28,fontFamily:"'Inter',sans-serif"}}>Subscribe to get the latest updates on courses and AR/VR learning.</p>
        <form onSubmit={handleSubmit} style={{maxWidth:480,margin:'0 auto'}}>
          <div style={{display:'flex',borderRadius:14,overflow:'hidden',border:'1px solid rgba(0,0,0,0.08)',boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="Enter your email address..."
              style={{flex:1,border:'none',padding:'16px 20px',fontFamily:"'Inter',sans-serif",fontSize:14,outline:'none',background:'#fff'}}/>
            <button type="submit" disabled={status==='loading'}
              style={{background:status==='loading'?'#ffaa44':'#f4911a',color:'#fff',border:'none',padding:'16px 24px',fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',transition:'all 0.3s'}}>
              {status==='loading'?'..':'Subscribe Now'}
            </button>
          </div>
          {msg && <p style={{marginTop:12,fontSize:13,color:status==='success'?'#16a34a':'#dc2626',fontFamily:"'Inter',sans-serif"}}>{msg}</p>}
        </form>
      </div>
    </section>
  )
}

export default function StaticPartnersSection() {
  const navigate = useNavigate()
  return (
    <>
      {/* Stats */}
      <section style={{padding:'48px 0',background:'#fff',borderTop:'1px solid rgba(0,0,0,0.05)',borderBottom:'1px solid rgba(0,0,0,0.05)'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 48px',display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
          {[['48+','Total Students'],['38','Certified'],['70+','Top Lessons'],['100+','Pro Videos']].map(([n,l],i)=>(
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              style={{textAlign:'center',padding:'16px 0',borderRight:i<3?'1px solid rgba(0,0,0,0.06)':'none'}}>
              <div style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:38,fontWeight:800,color:'#f4911a',lineHeight:1}}>{n}</div>
              <div style={{fontSize:13,color:'#6b7280',marginTop:6,fontFamily:"'Inter',sans-serif"}}>{l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{padding:'120px 0',background:'#fafafa'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 48px'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:10,color:'#f4911a',fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',marginBottom:16,fontFamily:"'Inter',sans-serif"}}>
              <div style={{width:28,height:2,background:'#f4911a',borderRadius:2}}/>Our Qualified People Matter
            </div>
            <h2 style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:42,fontWeight:800,color:'#1a1a2e',letterSpacing:'-1.5px'}}>Top Class Instructors</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:20}}>
            {team.map((t,i)=>(
              <motion.div key={i} initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
                whileHover={{y:-6,boxShadow:'0 16px 48px rgba(0,0,0,0.1)'}}
                style={{background:'#fff',border:'1px solid rgba(0,0,0,0.06)',borderRadius:20,overflow:'hidden',transition:'all 0.4s'}}>
                <div style={{height:200,background:t.grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:64,fontWeight:800,color:'rgba(255,255,255,0.5)',fontFamily:"'Lexend Deca',sans-serif"}}>{t.init}</div>
                <div style={{padding:22}}>
                  <div style={{fontSize:11,color:'#f4911a',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:"'Inter',sans-serif"}}>{t.role}</div>
                  <h4 style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:16,fontWeight:700,color:'#1a1a2e'}}>{t.name}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Fix 4: Become Instructor routes to internal page */}
      <section style={{padding:'120px 0',background:'#fff'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 48px'}}>
          <div style={{background:'linear-gradient(135deg,rgba(253,224,71,0.15),rgba(244,114,182,0.1))',border:'1px solid rgba(244,145,26,0.15)',borderRadius:28,padding:'72px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:40,flexWrap:'wrap',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:'-60%',right:'-20%',width:400,height:400,background:'radial-gradient(circle,rgba(244,145,26,0.08) 0%,transparent 70%)',pointerEvents:'none'}}/>
            <div style={{position:'relative',zIndex:1}}>
              <h2 style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:38,fontWeight:800,color:'#1a1a2e',letterSpacing:'-1.5px',marginBottom:14}}>Join Us & Spread<br/>Experiences</h2>
              <p style={{fontSize:15,color:'#6b7280',lineHeight:1.7,maxWidth:460,marginBottom:28,fontFamily:"'Inter',sans-serif"}}>Share your expertise with thousands of students. Join our growing community of educators.</p>
              {/* FIX 4: Routes to internal instructor-profile page, not WordPress */}
              <motion.button whileHover={{y:-2,boxShadow:'0 12px 40px rgba(244,145,26,0.3)'}}
                onClick={() => navigate('/register?role=instructor')}
                style={{display:'inline-flex',alignItems:'center',gap:8,background:'#f4911a',color:'#fff',border:'none',borderRadius:12,padding:'15px 30px',fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:700,cursor:'pointer'}}>
                Become an Instructor →
              </motion.button>
            </div>
            <div style={{fontSize:100,opacity:0.15,flexShrink:0,position:'relative',zIndex:1}}>🎓</div>
          </div>
        </div>
      </section>

      {/* Fix 5: Newsletter with working API */}
      <NewsletterSection/>
    </>
  )
}
