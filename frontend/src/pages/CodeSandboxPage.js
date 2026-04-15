import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/core/Navbar';
import Footer from '@/components/core/Footer';
import { CodeSandbox } from '@/components/CodeSandbox';

export default function CodeSandboxPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [layout, setLayout] = useState('split');

  // Sample video URL - in production, this would come from the course/video data
  const sampleVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const handleLayoutChange = (e) => {
    setLayout(e.detail.layout);
  };

  // Listen for layout changes from CodeSandbox component
  if (typeof window !== 'undefined') {
    window.addEventListener('sandbox-layout-change', handleLayoutChange);
  }

  const handleSaveSnippet = (snippet) => {
    console.log('Snippet saved:', snippet);
    // In production, you might show a toast notification
  };

  return (
    <div className="sandbox-page">
      <Navbar />

      <div className="page-hero sandbox-hero">
        <div className="sasha-container">
          <div className="sandbox-header">
            <div className="sandbox-breadcrumb">
              <button onClick={() => navigate(-1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>
              <span>/</span>
              <span>Code Sandbox</span>
            </div>

            <div className="sandbox-title">
              <h1>Interactive Code Sandbox</h1>
              <p>Write, run, and experiment with code in real-time</p>
            </div>

            <div className="sandbox-features">
              <div className="feature-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Instant Execution
              </div>
              <div className="feature-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Save Snippets
              </div>
              {videoId && (
                <div className="feature-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                    <line x1="7" y1="2" x2="7" y2="22" />
                    <line x1="17" y1="2" x2="17" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                  Video Synced
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sandbox-content-wrapper">
        <div className="sasha-container">
          <div className="sandbox-main">
            <CodeSandbox
              initialLanguage="javascript"
              videoId={videoId}
              videoUrl={videoId ? sampleVideoUrl : null}
              layout={layout}
              onSave={handleSaveSnippet}
            />
          </div>

          <aside className="sandbox-sidebar">
            <div className="sidebar-card">
              <h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Keyboard Shortcuts
              </h3>
              <ul>
                <li>
                  <kbd>Ctrl/Cmd</kbd> + <kbd>Enter</kbd>
                  <span>Run code</span>
                </li>
                <li>
                  <kbd>Ctrl/Cmd</kbd> + <kbd>S</kbd>
                  <span>Save snippet</span>
                </li>
              </ul>
            </div>

            <div className="sidebar-card">
              <h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Tips
              </h3>
              <ul>
                <li>Use <code>console.log()</code> to see output in JavaScript</li>
                <li>Use <code>print()</code> for Python output</li>
                <li>Code executes in a sandboxed environment</li>
                <li>Maximum execution time is 5 seconds</li>
              </ul>
            </div>

            {videoId && (
              <div className="sidebar-card">
                <h3>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                    <line x1="7" y1="2" x2="7" y2="22" />
                    <line x1="17" y1="2" x2="17" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                  Video Sync
                </h3>
                <p>
                  Code snippets are synchronized with video timestamps.
                  As you watch the video, relevant code examples load automatically.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .sandbox-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .sandbox-hero {
          padding: 100px 0 40px;
          background: linear-gradient(180deg, #1a1a2e 0%, #082A5E 100%);
        }

        .sandbox-header {
          max-width: 800px;
        }

        .sandbox-breadcrumb {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .sandbox-breadcrumb button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sandbox-breadcrumb button:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        .sandbox-breadcrumb span {
          color: rgba(255, 255, 255, 0.4);
        }

        .sandbox-title h1 {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 12px;
          letter-spacing: -1px;
        }

        .sandbox-title p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
        }

        .sandbox-features {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          flex-wrap: wrap;
        }

        .feature-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(244, 145, 26, 0.15);
          border: 1px solid rgba(244, 145, 26, 0.3);
          border-radius: 20px;
          color: var(--sasha-primary, #f4911a);
          font-size: 13px;
          font-weight: 600;
        }

        .sandbox-content-wrapper {
          flex: 1;
          padding: 40px 0 80px;
          background: #0d1117;
        }

        .sasha-container {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 32px;
          max-width: 1400px;
        }

        .sandbox-main {
          height: calc(100vh - 280px);
          min-height: 500px;
        }

        .sandbox-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sidebar-card {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 20px;
        }

        .sidebar-card h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px;
          font-size: 14px;
          font-weight: 600;
          color: #f0f6fc;
        }

        .sidebar-card ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .sidebar-card li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 13px;
          color: #8b949e;
          border-bottom: 1px solid #21262d;
        }

        .sidebar-card li:last-child {
          border-bottom: none;
        }

        .sidebar-card kbd {
          display: inline-block;
          padding: 2px 6px;
          background: #21262d;
          border: 1px solid #30363d;
          border-radius: 4px;
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          color: #f0f6fc;
        }

        .sidebar-card span {
          flex: 1;
          text-align: right;
        }

        .sidebar-card code {
          padding: 2px 6px;
          background: #21262d;
          border-radius: 4px;
          font-family: 'Fira Code', monospace;
          font-size: 12px;
          color: var(--sasha-primary, #f4911a);
        }

        .sidebar-card p {
          font-size: 13px;
          color: #8b949e;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 1100px) {
          .sasha-container {
            grid-template-columns: 1fr;
          }

          .sandbox-sidebar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }

          .sandbox-main {
            height: 500px;
          }
        }

        @media (max-width: 768px) {
          .sandbox-hero {
            padding: 80px 0 32px;
          }

          .sandbox-title h1 {
            font-size: 24px;
          }

          .sandbox-features {
            flex-direction: column;
            align-items: flex-start;
          }

          .sandbox-sidebar {
            grid-template-columns: 1fr;
          }

          .sandbox-main {
            height: 400px;
          }
        }
      `}</style>
    </div>
  );
}
