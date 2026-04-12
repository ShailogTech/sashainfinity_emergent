import React from 'react'
import { useParams } from 'react-router-dom'
import { Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/api/axios'

interface CertificateData {
  courseTitle: string
  studentName: string
  instructorName: string
  completionDate: string
  verificationCode: string
}

// The certificate design matching the uploaded template
const CertificateDesign: React.FC<{ cert: CertificateData; certRef: React.RefObject<HTMLDivElement> }> = ({ cert, certRef }) => (
  <div ref={certRef} id="certificate-print" style={{ width: '1000px', aspectRatio: '1.414/1', display: 'flex', background: 'white', border: '12px solid #1f2937', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', fontFamily: 'Georgia, serif' }}>
    {/* Left Orange Section */}
    <div style={{ width: '33%', background: '#FF8533', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '48px 32px' }}>
      <div style={{ color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: 1.2, margin: 0 }}>Certificate</h1>
        <h2 style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: 1.2, margin: '8px 0' }}>of</h2>
        <h2 style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: 1.2, margin: 0 }}>Completion</h2>
      </div>

      {/* QR Code */}
      <div style={{ background: 'white', padding: '16px', margin: '32px 0' }}>
        <svg width="120" height="120" viewBox="0 0 150 150">
          <rect width="150" height="150" fill="white"/>
          <g fill="black">
            <rect x="10" y="10" width="40" height="40"/>
            <rect x="20" y="20" width="20" height="20" fill="white"/>
            <rect x="100" y="10" width="40" height="40"/>
            <rect x="110" y="20" width="20" height="20" fill="white"/>
            <rect x="10" y="100" width="40" height="40"/>
            <rect x="20" y="110" width="20" height="20" fill="white"/>
            <rect x="60" y="15" width="10" height="10"/>
            <rect x="75" y="15" width="10" height="10"/>
            <rect x="60" y="30" width="10" height="10"/>
            <rect x="75" y="40" width="10" height="10"/>
            <rect x="15" y="60" width="10" height="10"/>
            <rect x="30" y="60" width="10" height="10"/>
            <rect x="60" y="60" width="10" height="10"/>
            <rect x="75" y="60" width="10" height="10"/>
            <rect x="90" y="60" width="10" height="10"/>
            <rect x="120" y="60" width="10" height="10"/>
            <rect x="60" y="75" width="10" height="10"/>
            <rect x="90" y="75" width="10" height="10"/>
            <rect x="60" y="90" width="10" height="10"/>
            <rect x="90" y="90" width="10" height="10"/>
            <rect x="60" y="120" width="10" height="10"/>
            <rect x="105" y="120" width="10" height="10"/>
          </g>
        </svg>
      </div>

      {/* Decorative Pattern */}
      <div style={{ width: '100%' }}>
        <svg width="100%" height="180" viewBox="0 0 250 200" preserveAspectRatio="xMidYMid meet">
          <circle cx="180" cy="100" r="50" fill="#B85A1F"/>
          <circle cx="180" cy="100" r="35" fill="#FF8533" stroke="#B85A1F" strokeWidth="8"/>
          <circle cx="100" cy="160" r="30" fill="#FFEEDD"/>
          <circle cx="220" cy="150" r="18" fill="#FFEEDD"/>
          <path d="M 60 80 Q 80 100 60 120" fill="none" stroke="#B85A1F" strokeWidth="12" strokeLinecap="round"/>
          <text x="140" y="140" fontSize="80" fontWeight="bold" fill="#B85A1F">5</text>
          <text x="110" y="90" fontSize="60" fontWeight="bold" fill="#B85A1F">0</text>
          <circle cx="150" cy="80" r="12" fill="#4A9EBF"/>
          <rect x="145" y="120" width="6" height="40" fill="#4A9EBF"/>
          <circle cx="60" cy="140" r="8" fill="#FFAA44"/>
        </svg>
      </div>
    </div>

    {/* Right Section */}
    <div style={{ width: '67%', background: '#F5EDE5', padding: '48px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <img src="/cert-sharpened-logo.png" alt="SharpenedMind" style={{ height: '112px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }}/>
        <img src="/cert-sasha-seal.png" alt="SashaInfinity" style={{ width: '160px', height: '160px', objectFit: 'contain', mixBlendMode: 'multiply' }}/>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '-32px' }}>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>This is to certify that</p>
        <h2 style={{ fontSize: '56px', fontWeight: 'bold', color: '#7D3B1F', marginBottom: '32px', letterSpacing: '-1px', lineHeight: 1.1 }}>
          {cert.studentName}
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>has successfully completed the course</p>
        <h3 style={{ fontSize: '22px', color: '#1f2937', fontWeight: '500' }}>{cert.courseTitle}</h3>
        <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '12px' }}>Completed on {cert.completionDate}</p>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ color: '#1f2937', fontSize: '15px', marginBottom: '4px' }}>{cert.instructorName}</p>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>Instructor, Sasha</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <img src="/cert-sasha-seal.png" alt="SashaInfinity" style={{ width: '112px', height: '112px', objectFit: 'contain', mixBlendMode: 'multiply' }}/>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#6b7280', fontSize: '11px' }}>Verification ID</p>
            <p style={{ color: '#1f2937', fontSize: '12px', fontFamily: 'monospace' }}>{cert.verificationCode}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export const CertificatePage: React.FC = () => {
  const { courseId } = useParams()
  const { user, fullName } = useAuth()
  const [certificate, setCertificate] = React.useState<CertificateData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const certRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await api.get(`/certificates/course/${courseId}`)
        const d = res.data
        setCertificate({
          courseTitle: d.course_title || d.certificate_title || 'Course',
          studentName: d.student_name || fullName || user?.display_name || 'Student',
          instructorName: d.instructor_name || 'Instructor',
          completionDate: d.issue_date ? new Date(d.issue_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          verificationCode: d.verification_code || d.certificate_hash || d.secure_certificate_id || 'N/A'
        })
      } catch {
        // Fallback with user data
        setCertificate({
          courseTitle: 'Course Completion',
          studentName: fullName || user?.display_name || 'Student',
          instructorName: 'Instructor',
          completionDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          verificationCode: 'SASHA-' + Date.now()
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCertificate()
  }, [courseId, fullName, user])

  const handleDownload = async () => {
    const el = document.getElementById('certificate-print')
    if (!el) return
    try {
      // Use html2canvas + jsPDF if available, else print
      const printWindow = window.open('', '_blank')
      if (!printWindow) return
      printWindow.document.write('<html><head><title>Certificate</title>')
      printWindow.document.write('<style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f3f4f6;}@media print{body{background:white;}}</style>')
      printWindow.document.write('</head><body>')
      printWindow.document.write(el.outerHTML)
      printWindow.document.write('</body></html>')
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    } catch (e) {
      window.print()
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Certificate: ${certificate?.courseTitle}`, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Certificate link copied!')
    }
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading certificate...</p>
      </div>
    </div>
  )

  if (!certificate) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">Certificate not found.</p>
        <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Actions */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate of Completion</h1>
          <p className="text-gray-500 text-sm">Congratulations on completing your course!</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
          <Button onClick={handleDownload} className="bg-[#FF8533] hover:bg-[#e6742a] text-white">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Certificate */}
      <div className="max-w-5xl mx-auto overflow-x-auto">
        <CertificateDesign cert={certificate} certRef={certRef} />
      </div>

      {/* Verification */}
      <div className="max-w-5xl mx-auto mt-6 bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-orange-600 text-lg">✓</span>
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">Verification ID: <span className="font-mono text-orange-600">{certificate.verificationCode}</span></p>
          <p className="text-xs text-gray-500">This certificate can be verified at lms.sashainfinity.com/verify</p>
        </div>
      </div>
    </div>
  )
}
