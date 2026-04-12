import React from 'react'
import { Link } from 'react-router-dom'

const base = "https://sashainfinity.com/wp-content/uploads"

const models = [
  { name: "Interactive VR Demo", url: `${base}/2026/01/Rough-Work-For-Website.glb` },
  { name: "Pythagorean Theorem", url: `${base}/2026/02/Pythagorean-Theorem-Animated-For-Website-Done.glb` },
  { name: "Rhombic Dodecahedron", url: `${base}/2026/02/Rhombic-Dodecahedron-Animated-For-Website-Done.glb` },
  { name: "Ordinary Helicoid", url: `${base}/2026/02/Ordinary-Helicoid-Animation-For-Website-Done.glb` },
  { name: "Sierpinski Triangle", url: `${base}/2026/02/Sierpinski-Animation-For-Website-Done.glb` },
  { name: "Costas Minimal Surface", url: `${base}/2026/02/Costas-Minimal-Surface-Animation-For-Website-Done.glb` },
  { name: "Cross Product", url: `${base}/2026/02/Cross-Production-Animated-For-Website-Done.glb` },
  { name: "Divergence", url: `${base}/2026/02/Divergence-Animated-Animated-For-Website-Done.glb` },
  { name: "Dot Product", url: `${base}/2026/02/Dot-Product-Animated-For-Website-Done.glb` },
  { name: "Dinis Surface", url: `${base}/2026/02/Dinis-Surface-Animated-For-Website-Done.glb` },
  { name: "Riemann Surfaces", url: `${base}/2026/02/Riemann-Surfaces-AAnimation-For-Website-Done.glb` },
  { name: "Barth Sextic", url: `${base}/2026/02/barth-sextic-Animation-For-Website-Done.glb` },
  { name: "Alexander Horned Sphere", url: `${base}/2026/01/Alexander-Horned-Sphere.glb` },
  { name: "Mobius Strip", url: `${base}/2026/01/mobius-strip-model.glb` },
  { name: "Oloid", url: `${base}/2026/01/Oloid.glb` },
  { name: "Sphericon", url: `${base}/2026/01/Sphericon.glb` },
  { name: "Pascal Pyramid", url: `${base}/2025/06/pascals_pyramid.glb` },
  { name: "Hyperboloid", url: `${base}/2025/06/hyperboloid.glb` },
  { name: "Hyperbolic Paraboloid", url: `${base}/2025/06/hypar_approximately.glb` },
  { name: "Extruded Sine Waves", url: `${base}/2025/06/extruded_sine_waves_inside_a_cuboid.glb` },
  { name: "Catenoide", url: `${base}/2025/06/catenoide.glb` },
  { name: "Catenoid", url: `${base}/2025/06/catenoid.glb` },
  { name: "3D Lattice", url: `${base}/2025/06/3d_lattice.glb` },
  { name: "Stereomatria", url: `${base}/2025/06/stereomatria.glb` },
  { name: "Saddle Wires", url: `${base}/2025/06/saddle_wires.glb` },
  { name: "Menger Sponge", url: `${base}/2025/07/menger_sponge.glb` },
  { name: "Boys Surface", url: `${base}/2025/07/boys_surface.glb` },
  { name: "Borromean Rings", url: `${base}/2025/07/borromean_rings.glb` },
  { name: "Gyroid", url: `${base}/2025/07/gyroid.glb` },
  { name: "Klein Bottle", url: `${base}/2025/07/klein_bottle_2.glb` },
  { name: "Julia Quaternion", url: `${base}/2025/07/julia_quaternion.glb` },
  { name: "Enneper Surface", url: `${base}/2025/07/enneper_surface.glb` },
  { name: "Dodecahedron", url: `${base}/2025/07/dodecahedron.glb` },
  { name: "Snub Cube", url: `${base}/2025/07/snub_cube.glb` },
  { name: "Penrose Triangle", url: `${base}/2025/07/penrose_triangle-large.glb` },
  { name: "Scherks Minimal Surface", url: `${base}/2025/07/scherks_minimal_surface_scherk.glb` },
  { name: "Octahedron", url: `${base}/2025/07/octahedron.glb` },
  { name: "3D Hilbert Curve", url: `${base}/2025/07/3d_hilbert_curve_3rd_iteration.glb` },
]

declare global { namespace JSX { interface IntrinsicElements { "model-viewer": any } } }

export function MeiporulARPage() {
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<typeof models[0] | null>(null)
  const [loaded, setLoaded] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    if (!document.querySelector("script[src*=model-viewer]")) {
      const s = document.createElement("script")
      s.type = "module"
      s.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
      document.head.appendChild(s)
    }
  }, [])

  const filtered = models.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
  const loadedModels = filtered.filter(m => loaded[m.url] !== false)
  const failedModels = filtered.filter(m => loaded[m.url] === false)

  return (
    <div style={{minHeight:"100vh", background:"#ffffff", color:"#1a1a2e", fontFamily:"Inter,sans-serif"}}>

      {/* Header Banner */}
      <div style={{background:"linear-gradient(135deg,#f4911a,#ffaa44)", padding:"60px 24px", textAlign:"center"}}>
        <h1 style={{fontSize:"clamp(28px,4vw,42px)", fontWeight:800, color:"#fff", marginBottom:8, fontFamily:"Lexend Deca,sans-serif"}}>
          Meiporul AR Gallery
        </h1>
        <p style={{color:"rgba(255,255,255,0.9)", fontSize:16}}>
          {models.length} Interactive 3D Models — View in AR on your phone
        </p>
      </div>

      {/* Search */}
      <div style={{maxWidth:1200, margin:"0 auto", padding:"32px 24px 0", display:"flex", justifyContent:"center"}}>
        <input
          type="text"
          placeholder="Search models..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width:"100%", maxWidth:480, padding:"14px 20px", borderRadius:14,
            border:"1.5px solid rgba(244,145,26,0.3)", fontSize:15,
            outline:"none", background:"#fff", color:"#1a1a2e",
            boxShadow:"0 2px 12px rgba(0,0,0,0.06)"
          }}
        />
      </div>

      {/* Grid - loaded models first */}
      <div style={{maxWidth:1200, margin:"0 auto", padding:"32px 24px 60px"}}>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:24}}>
          {loadedModels.map((model, i) => (
            <div key={i} onClick={() => setSelected(model)}
              style={{
                background:"#fff", borderRadius:20, overflow:"hidden",
                border:"1px solid rgba(0,0,0,0.08)", cursor:"pointer",
                boxShadow:"0 2px 12px rgba(0,0,0,0.06)", transition:"all 0.3s"
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow="0 8px 32px rgba(244,145,26,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)")}
            >
              <div style={{height:220, background:"#f8f8fc", position:"relative"}}>
                <model-viewer
                  src={model.url}
                  auto-rotate camera-controls ar
                  ar-modes="webxr scene-viewer quick-look"
                  style={{width:"100%", height:"100%", background:"#f8f8fc"}}
                  loading="lazy"
                  onError={() => setLoaded(p => ({...p, [model.url]: false}))}
                  onLoad={() => setLoaded(p => ({...p, [model.url]: true}))}
                />
                <div style={{position:"absolute", top:10, right:10, display:"flex", gap:6}}>
                  <span style={{background:"#f4911a", color:"#fff", fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:700}}>AR</span>
                  <span style={{background:"#22c55e", color:"#fff", fontSize:11, padding:"3px 10px", borderRadius:20}}>Ready</span>
                </div>
              </div>
              <div style={{padding:"14px 16px"}}>
                <h3 style={{fontSize:15, fontWeight:600, color:"#1a1a2e", margin:0}}>{model.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16}}>
          <div style={{width:"100%", maxWidth:800, background:"#fff", borderRadius:24, overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,0.2)"}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px", borderBottom:"1px solid rgba(0,0,0,0.08)"}}>
              <h2 style={{fontSize:20, fontWeight:700, color:"#1a1a2e", margin:0}}>{selected.name}</h2>
              <button onClick={() => setSelected(null)}
                style={{background:"rgba(0,0,0,0.06)", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", fontSize:18, color:"#6b7280"}}>
                ×
              </button>
            </div>
            <model-viewer
              src={selected.url} auto-rotate camera-controls ar
              ar-modes="webxr scene-viewer quick-look"
              style={{width:"100%", height:500, background:"#f8f8fc"}}
            />
          </div>
        </div>
      )}
    </div>
  )
}
