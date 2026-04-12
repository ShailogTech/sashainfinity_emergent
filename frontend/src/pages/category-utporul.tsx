import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, BookOpen, Users, Clock, Star } from 'lucide-react';
import { api } from '@/api/axios';
import { CourseCard } from '@/components/course/course-card';
import { Course } from '@/types';
import styles from '@/styles/category-page.module.css';

interface APICourse {
  id: number;
  title: string;
  description: string;
  post_excerpt: string;
  post_content: string;
  course_price: number;
  course_sale_price: number;
  course_price_type: string;
  course_level: string;
  course_duration: string;
  course_thumbnail: string;
  course_intro_video?: string;
  average_rating: number;
  total_reviews: number;
  total_enrollments: number;
  instructor: {
    id: number;
    display_name: string;
    user_email: string;
    profile: {
      profile_photo: string;
      bio: string;
      qualifications: string[];
      experience_years: number;
    };
  };
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  lessons: Array<{
    id: number;
    title: string;
    duration: string;
    lesson_type: string;
  }>;
}

const convertAPICourseToLocal = (apiCourse: APICourse): Course => {
  return {
    id: apiCourse.id,
    post_title: apiCourse.title,
    post_excerpt: apiCourse.post_excerpt,
    post_content: apiCourse.post_content,
    course_price: apiCourse.course_price,
    course_sale_price: apiCourse.course_sale_price,
    course_price_type: apiCourse.course_price_type,
    course_level: apiCourse.course_level,
    course_duration: apiCourse.course_duration,
    course_thumbnail: apiCourse.course_thumbnail,
    course_intro_video: apiCourse.course_intro_video,
    average_rating: apiCourse.average_rating,
    total_reviews: apiCourse.total_reviews,
    total_enrollments: apiCourse.total_enrollments,
    instructor: {
      id: apiCourse.instructor.id,
      display_name: apiCourse.instructor.display_name,
      user_email: apiCourse.instructor.user_email,
      user_login: apiCourse.instructor.display_name.toLowerCase(),
      user_nicename: apiCourse.instructor.display_name.toLowerCase(),
      user_registered: '2024-01-01',
      user_status: 0,
      is_active: true,
      is_verified: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      last_login: '2024-01-01',
      profile: apiCourse.instructor.profile,
    },
    categories: apiCourse.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: `Learn ${cat.name}`,
      created_at: '2024-01-01',
    })),
    lessons: apiCourse.lessons.map((lesson) => ({
      id: lesson.id,
      post_title: lesson.title,
      lesson_duration: lesson.duration,
      lesson_type: lesson.lesson_type,
      lesson_order: 0,
      lesson_content: '',
      lesson_video_url: '',
      is_preview: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    })),
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };
};

export const UtporulPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    avgRating: 0,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/courses', {
          params: {
            category: 'utporul',
            limit: 100,
          },
        });

        const convertedCourses = response.data.courses.map(convertAPICourseToLocal);
        setCourses(convertedCourses);

        // Calculate stats
        const totalStudents = convertedCourses.reduce(
          (sum, course) => sum + course.total_enrollments,
          0
        );
        const avgRating =
          convertedCourses.reduce((sum, course) => sum + course.average_rating, 0) /
          (convertedCourses.length || 1);

        setStats({
          totalCourses: convertedCourses.length,
          totalStudents,
          avgRating: Math.round(avgRating * 10) / 10,
        });
      } catch (error) {
        console.error('Error fetching Utporul courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className={styles.categoryPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>
            <Lightbulb size={64} />
          </div>
          <h1>Utporul</h1>
          <p className={styles.heroDescription}>
            Utporul encompasses metaphysics, epistemology, and the fundamental truths of existence.
            Explore the philosophical foundations that shape understanding of reality, knowledge, and
            the nature of being through ancient Tamil wisdom.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <BookOpen size={24} />
              <div>
                <strong>{stats.totalCourses}</strong>
                <span>Courses</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <Users size={24} />
              <div>
                <strong>{stats.totalStudents}</strong>
                <span>Students</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <Star size={24} />
              <div>
                <strong>{stats.avgRating}</strong>
                <span>Avg Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.about}>
        <div className={styles.container}>
          <h2>About Utporul</h2>
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <p>
                <strong>Utporul</strong> (உட்பொருள்) represents the internal substance or essence in
                Tamil literary tradition. It is one of the three primary divisions of classical Tamil
                literature alongside Meiporul and Seyappaduporul.
              </p>
              <p>
                This category explores the deeper philosophical aspects including:
              </p>
              <ul>
                <li>Metaphysical concepts and the nature of reality</li>
                <li>Epistemology and theories of knowledge</li>
                <li>Ethics and moral philosophy</li>
                <li>Spiritual wisdom and self-realization</li>
                <li>Ancient Tamil philosophical texts and commentaries</li>
              </ul>
            </div>
            <div className={styles.aboutImage}>
              <img
                src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop"
                alt="Utporul - Philosophy and Wisdom"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className={styles.courses}>
        <div className={styles.container}>
          <h2>Available Courses</h2>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading courses...</p>
            </div>
          ) : courses.length > 0 ? (
            <div className={styles.coursesGrid}>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className={styles.noCourses}>
              <Lightbulb size={48} />
              <h3>No courses available yet</h3>
              <p>Check back soon for new Utporul courses!</p>
              <Link to="/courses" className={styles.browseButton}>
                Browse All Courses
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>Ready to Begin Your Journey?</h2>
          <p>
            Explore the profound wisdom of Utporul and deepen your understanding of philosophy,
            metaphysics, and the nature of existence.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/courses" className={styles.primaryButton}>
              Browse All Courses
            </Link>
            <Link to="/about" className={styles.secondaryButton}>
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
