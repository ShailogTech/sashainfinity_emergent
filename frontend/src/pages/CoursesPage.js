import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function CoursesPage() {
  const [filter, setFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/courses`);

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`);
      }

      const data = await response.json();
      setCourses(data.courses || data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError(error.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter(c => {
    if (filter !== "all" && c.category !== filter) return false;
    if (levelFilter !== "all" && c.level !== levelFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="sasha-page courses-page" data-testid="courses-page">
        <div className="sasha-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sasha-page courses-page" data-testid="courses-page">
        <div className="sasha-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <p className="text-red-800 font-medium mb-2">Error loading courses</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={fetchCourses}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sasha-page courses-page" data-testid="courses-page">
      <div className="page-hero">
        <div className="sasha-container">
          <div className="page-hero-content">
            <div className="section-label" style={{ justifyContent: "center" }}>Premium Learning</div>
            <h1>All Courses</h1>
            <p>Discover thousands of courses from expert instructors</p>
          </div>
        </div>
      </div>

      <div className="sasha-container" style={{ paddingTop: 60, paddingBottom: 100 }}>
        <div className="courses-filters" data-testid="courses-filters">
          <div className="filter-group">
            <label>Category</label>
            <div className="filter-pills">
              {["all", "development", "analytics"].map(cat => (
                <button key={cat} className={`filter-pill ${filter === cat ? "active" : ""}`}
                  onClick={() => setFilter(cat)} data-testid={`filter-${cat}`}>
                  {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Level</label>
            <div className="filter-pills">
              {["all", "intermediate", "advanced"].map(lev => (
                <button key={lev} className={`filter-pill ${levelFilter === lev ? "active" : ""}`}
                  onClick={() => setLevelFilter(lev)} data-testid={`filter-level-${lev}`}>
                  {lev === "all" ? "All" : lev.charAt(0).toUpperCase() + lev.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <p className="filter-count">{filtered.length} courses found</p>
        </div>

        {filtered.length > 0 ? (
          <div className="courses-grid" data-testid="courses-grid">
            {filtered.map(course => (
              <Link to={`/courses/${course.id}`} className="course-card" key={course.id} data-testid={`course-card-${course.id}`}>
                <div className="course-card-img">
                  <img src={course.image || course.thumbnail || "https://via.placeholder.com/800x450"} alt={course.title} />
                  <span className={`course-level ${course.level || 'intermediate'}`}>{course.level || 'Intermediate'}</span>
                </div>
                <div className="course-card-body">
                  <div className="course-instructor">
                    <i className="fa-solid fa-user-circle"></i>
                    <span>{course.instructor || "Instructor"}</span>
                  </div>
                  <h3>{course.title}</h3>
                  <p className="course-desc">{course.shortDesc || course.description}</p>
                  <div className="course-meta">
                    <span><i className="fa-solid fa-clock"></i> {course.duration || "Self-paced"}</span>
                    <span><i className="fa-solid fa-users"></i> {course.students || course.enrolled || 0}</span>
                  </div>
                  <div className="course-card-footer">
                    <span className="course-price">{"\u20B9"}{(course.price || 0).toLocaleString()}</span>
                    <span className="enroll-btn" data-testid={`enroll-btn-${course.id}`}>View Course</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="fa-solid fa-book-open text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 font-medium">No courses found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
