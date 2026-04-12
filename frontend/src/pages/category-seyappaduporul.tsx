import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, BookOpen, Users, Clock, Star } from 'lucide-react';
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

export const SeyappaduporulPage = () => {
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
            category: 'seyappaduporul',
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
        console.error('Error fetching Seyappaduporul courses:', error);
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
            <Sun size={64} />
          </div>
          <h1>Seyappaduporul</h1>
          <p className={styles.heroDescription}>
            Seyappaduporul focuses on the practical application and expression of knowledge through
            poetic forms, rhetoric, and literary techniques. Master the art of composition, prosody,
            and the technical aspects of Tamil literature.
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
          <h2>About Seyappaduporul</h2>
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <p>
                <strong>Seyappaduporul</strong> (செய்யப்படுபொருள்) refers to the artificial or
                crafted subject matter in Tamil poetics. It deals with the technical and practical
                aspects of literary creation, including meter, rhyme, and rhetorical devices.
              </p>
              <p>
                Our courses in this category cover:
              </p>
              <ul>
                <li>Tamil prosody (யாப்பிலக்கணம்) and meter structures</li>
                <li>Rhetorical figures and literary devices (அணி இலக்கணம்)</li>
                <li>Poetic composition techniques and practices</li>
                <li>Grammar and linguistic structures in Tamil</li>
                <li>Practical exercises in writing Tamil poetry and prose</li>
              </ul>
            </div>
            <div className={styles.aboutImage}>
              <img
                src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=2073&auto=format&fit=crop"
                alt="Seyappaduporul - Tamil Poetics and Composition"
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
              <Sun size={48} />
              <h3>No courses available yet</h3>
              <p>Check back soon for new Seyappaduporul courses!</p>
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
          <h2>Master the Art of Tamil Composition</h2>
          <p>
            Learn the technical mastery and practical skills needed to create beautiful Tamil
            literature through the systematic study of Seyappaduporul.
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
