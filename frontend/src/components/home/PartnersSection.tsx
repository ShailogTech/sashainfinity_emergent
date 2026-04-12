import React from 'react'
const logos = [
  {name:'Sona Incubations',src:'https://sashainfinity.com/wp-content/uploads/2025/06/sif-logo-png-e1750397156954.png'},
  {name:'StartupTN',src:'https://sashainfinity.com/wp-content/uploads/2025/06/blue-horizontal-3-scaled.png'},
  {name:'Trueline Research',src:'https://sashainfinity.com/wp-content/uploads/2025/06/Trueline-lOGO-1-scaled-e1750400158902.png'},
]
const all = [...logos,...logos,...logos,...logos]
export default function PartnersSection() {
  return (
    <section style={{padding:'40px 0',background:'#fff',borderTop:'1px solid rgba(0,0,0,0.05)',borderBottom:'1px solid rgba(0,0,0,0.05)',overflow:'hidden'}}>
      <div style={{WebkitMaskImage:'linear-gradient(to right,transparent,black 10%,black 90%,transparent)',maskImage:'linear-gradient(to right,transparent,black 10%,black 90%,transparent)'}}>
        <div style={{display:'flex',animation:'ps 25s linear infinite',width:'max-content'}}>
          {all.map((p,i) => (
            <div key={i} style={{flexShrink:0,width:160,margin:'0 24px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <img src={p.src} alt={p.name} style={{height:44,width:'100%',objectFit:'contain',filter:'grayscale(100%) brightness(0.6)',transition:'all 0.4s'}}
                onMouseEnter={e=>{const t=e.target as HTMLImageElement;t.style.filter='grayscale(0%)';t.style.transform='scale(1.08)'}}
                onMouseLeave={e=>{const t=e.target as HTMLImageElement;t.style.filter='grayscale(100%) brightness(0.6)';t.style.transform='scale(1)'}}
                onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
            </div>
          ))}
        </div>
      </div>
      <style>{'@keyframes ps{from{transform:translateX(0)}to{transform:translateX(-50%)}}'}</style>
    </section>
  )
}
