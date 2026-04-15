import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCourse(id);
    }
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE}/api/courses/${id}`, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch course: ${response.statusText}`);
      }

      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
      setError(error.message);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="sasha-page course-detail-page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="sasha-page course-detail-page" data-testid="course-not-found" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", color: "#6b7280", marginBottom: "1rem" }}>Course not found</h2>
          <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>The course you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            style={{ cursor: "pointer" }}
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  const otherCourses = []; // Could fetch related courses from API if needed

  return (
    <div className="sasha-page course-detail-page" data-testid="course-detail-page">
      {/* Hero */}
      <div className="cd-hero" data-testid="cd-hero">
        <div className="sasha-container">
          <button
            onClick={() => navigate("/courses")}
            className="back-link"
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Courses
          </button>
          <div className="cd-hero-content">
            <h1>{course.title}</h1>
            <div className="cd-meta">
              <span className="cd-level">{course.level || 'Intermediate'}</span>
              <span className="cd-instructor">
                <i className="fa-solid fa-chalkboard-teacher"></i> {course.instructor || "Instructor"}
              </span>
              <span className="cd-duration">
                <i className="fa-regular fa-clock"></i> {course.duration || "Self-paced"}
              </span>
              <span className="cd-students">
                <i className="fa-solid fa-users"></i> {(course.students || course.enrolled || 0).toLocaleString()} students
              </span>
              <span className="cd-price">
                {"\u20B9"}{(course.price || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="sasha-container">
        <div className="cd-content-wrapper">
          {/* Main Content */}
          <div className="cd-main">
            {/* Tabs */}
            <div className="cd-tabs">
              <button className="cd-tab active">Overview</button>
              <button className="cd-tab">Curriculum</button>
              <button className="cd-tab">Instructor</button>
              <button className="cd-tab">Reviews</button>
            </div>

            {/* Tab Content */}
            <div className="cd-tab-content">
              {/* Description */}
              <section className="cd-section">
                <h2>About this Course</h2>
                <p>{course.desc || course.description || course.shortDesc || "No description available."}</p>
              </section>

              {/* Features */}
              {course.features && course.features.length > 0 && (
                <section className="cd-section">
                  <h2>Course Features</h2>
                  <ul className="cd-features">
                    {course.features.map((feature, index) => (
                      <li key={index}>
                        <i className="fa-solid fa-check text-green-500"></i> {feature}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* What You'll Learn */}
              {course.whatYouLearn && course.whatYouLearn.length > 0 && (
                <section className="cd-section">
                  <h2>What You'll Learn</h2>
                  <ul className="cd-learn-list">
                    {course.whatYouLearn.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <section className="cd-section">
                  <h2>Requirements</h2>
                  <ul className="cd-requirements-list">
                    {course.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Curriculum */}
              {course.curriculum && course.curriculum.length > 0 && (
                <section className="cd-section">
                  <h2>Course Curriculum</h2>
                  {course.curriculum.map((section, index) => (
                    <div key={index} className="cd-curriculum-section">
                      <h3>{section.section}</h3>
                      <ul>
                        {section.lessons.map((lesson, lessonIndex) => (
                          <li key={lessonIndex}>
                            <span>{lesson.title}</span>
                            <span className="cd-lesson-duration">{lesson.duration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="cd-sidebar">
            {/* Enroll Card */}
            <div className="cd-enroll-card">
              <div className="cd-price-large">
                {"\u20B9"}{(course.price || 0).toLocaleString()}
              </div>
              <button className="cd-enroll-btn">
                Enroll Now
              </button>
              <p className="cd-guarantee">
                <i className="fa-solid fa-shield-halved"></i> 30-day money-back guarantee
              </p>
            </div>

            {/* Course Stats */}
            <div className="cd-stats">
              <div className="cd-stat">
                <i className="fa-regular fa-clock"></i>
                <div>
                  <strong>{course.duration || "Self-paced"}</strong>
                  <span>Duration</span>
                </div>
              </div>
              <div className="cd-stat">
                <i className="fa-solid fa-play-circle"></i>
                <div>
                  <strong>{course.lessons || 0}</strong>
                  <span>Lessons</span>
                </div>
              </div>
              <div className="cd-stat">
                <i className="fa-solid fa-users"></i>
                <div>
                  <strong>{(course.students || course.enrolled || 0).toLocaleString()}</strong>
                  <span>Students</span>
                </div>
              </div>
              <div className="cd-stat">
                <i className="fa-solid fa-certificate"></i>
                <div>
                  <strong>Certificate</strong>
                  <span>of completion</span>
                </div>
              </div>
            </div>

            {/* Instructor */}
            <div className="cd-instructor-card">
              <h3>Instructor</h3>
              <p>{course.instructor || "Instructor"}</p>
              <span className="cd-instructor-role">
                {course.level === "advanced" ? "Expert Instructor" : course.level === "intermediate" ? "Experienced Instructor" : "Instructor"}
              </span>
            </div>
          </div>
        </div>

        {/* Related Courses */}
        {otherCourses.length > 0 && (
          <div className="cd-related">
            <h2>Related Courses</h2>
            <div className="cd-related-grid">
              {otherCourses.map((relatedCourse) => (
                <Link
                  key={relatedCourse.id}
                  to={`/courses/${relatedCourse.id}`}
                  className="course-card-mini"
                >
                  <img src={relatedCourse.image} alt={relatedCourse.title} />
                  <h4>{relatedCourse.title}</h4>
                  <p className="price">₹{relatedCourse.price}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
