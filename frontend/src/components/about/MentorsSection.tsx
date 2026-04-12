import React, { useEffect, useState } from 'react';
import { api } from '@/api/axios';
import styles from './AboutSections.module.css';

interface Instructor {
  id: number;
  name: string;
  email: string;
  profile_photo: string;
  description: string;
  expertise: string | null;
  course_count: number;
  rating: number;
}

const MentorsSection = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopInstructors = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/users/instructors/top?limit=5');

        // If API returns empty array or no data, use fallback
        if (!response.data || response.data.length === 0) {
          setInstructors([
            {
              id: 1,
              name: 'Deepikasri',
              email: 'deepikasri@example.com',
              profile_photo: 'https://sashainfinity.com/wp-content/uploads/2025/06/Sasha_tutor_profile.jpg',
              description: 'Expert in Data Analytics',
              expertise: 'Data Analytics',
              course_count: 5,
              rating: 5.0
            },
            {
              id: 2,
              name: 'Sowmiya',
              email: 'sowmiya@example.com',
              profile_photo: 'https://ui-avatars.com/api/?name=Sowmiya&background=6366f1&color=fff&size=200',
              description: 'Specialist in Mathematics',
              expertise: 'Mathematics',
              course_count: 3,
              rating: 4.9
            },
            {
              id: 3,
              name: 'Saran',
              email: 'saran@example.com',
              profile_photo: 'https://ui-avatars.com/api/?name=Saran&background=8b5cf6&color=fff&size=200',
              description: 'Expert in Full Stack Web Development',
              expertise: 'Full Stack Web Dev',
              course_count: 4,
              rating: 4.8
            }
          ]);
        } else {
          setInstructors(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch top instructors:', error);
        // Fallback to default instructors if API fails
        setInstructors([
          {
            id: 1,
            name: 'Deepikasri',
            email: 'deepikasri@example.com',
            profile_photo: 'https://sashainfinity.com/wp-content/uploads/2025/06/Sasha_tutor_profile.jpg',
            description: 'Expert in Data Analytics',
            expertise: 'Data Analytics',
            course_count: 5,
            rating: 5.0
          },
          {
            id: 2,
            name: 'Sowmiya',
            email: 'sowmiya@example.com',
            profile_photo: 'https://ui-avatars.com/api/?name=Sowmiya&background=6366f1&color=fff&size=200',
            description: 'Specialist in Mathematics',
            expertise: 'Mathematics',
            course_count: 3,
            rating: 4.9
          },
          {
            id: 3,
            name: 'Saran',
            email: 'saran@example.com',
            profile_photo: 'https://ui-avatars.com/api/?name=Saran&background=8b5cf6&color=fff&size=200',
            description: 'Expert in Full Stack Web Development',
            expertise: 'Full Stack Web Dev',
            course_count: 4,
            rating: 4.8
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopInstructors();
  }, []);

  if (isLoading) {
    return (
      <section className={`${styles.section} ${styles.mentorSection}`}>
        <div className={styles.container}>
          <div className={styles.sectionTitle}>
            <p className={styles.preTitle}>OUR QUALIFIED PEOPLE MATTER</p>
            <h2>Top Class Mentors</h2>
          </div>
          <div className={styles.mentorGrid}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`${styles.mentorCard} ${styles.loading}`}>
                <div className={styles.profileImgSkeleton}></div>
                <div className={styles.nameSkeleton}></div>
                <div className={styles.ratingSkeleton}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.section} ${styles.mentorSection}`}>
      <div className={styles.container}>
        <div className={styles.sectionTitle}>
          <p className={styles.preTitle}>OUR QUALIFIED PEOPLE MATTER</p>
          <h2>Top Class Mentors</h2>
        </div>
        <div className={styles.mentorGrid}>
          {instructors.map((instructor) => (
            <div key={instructor.id} className={styles.mentorCard}>
              <img
                src={instructor.profile_photo}
                alt={`Profile of ${instructor.name}`}
                className={styles.profileImg}
                onError={(e) => {
                  // Fallback to avatar if image fails to load
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${instructor.name.replace(' ', '+')}&background=6366f1&color=fff&size=200`;
                }}
              />
              <h3>{instructor.name}</h3>
              <p className={styles.expertise}>{instructor.expertise || instructor.description}</p>
              <div className={styles.rating}>
                ⭐ ({instructor.rating.toFixed(1)})
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorsSection;
