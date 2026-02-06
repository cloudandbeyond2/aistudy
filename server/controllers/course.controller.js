import Course from '../models/Course.js';
import OrgCourse from '../models/OrgCourse.js';
import Lang from '../models/Lang.js';
import unsplash from '../config/unsplash.js';
import IssuedCertificate from '../models/IssuedCertificate.js';

/**
 * CREATE COURSE
 */
export const createCourse = async (req, res) => {
  const { user, content, type, mainTopic, lang } = req.body;

  const defaultPhoto =
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

  try {
    let photo = defaultPhoto;

    try {
      const result = await unsplash.search.getPhotos({
        query: mainTopic,
        page: 1,
        perPage: 1,
        orientation: 'landscape'
      });

      const photos = result.response?.results;
      if (photos && photos.length > 0) {
        photo = photos[0].urls.regular;
      }
    } catch (err) {
      console.log('Unsplash failed, using default image');
    }

    // Find the user to get their organizationId
    const User = (await import('../models/User.js')).default;
    const creator = await User.findById(user);

    const newCourse = new Course({
      user,
      organizationId: creator?.organization || null,
      content,
      type,
      mainTopic,
      photo
    });

    await newCourse.save();

    const newLang = new Lang({
      course: newCourse._id,
      lang
    });
    await newLang.save();

    // Generate Assignments in parallel if it's an Organization context or generally requested
    // For now, we generate for all new courses to satisfy "when course generate parallaly generate assignment topics related to the course topics"
    try {
      const { generateAssignments } = await import('./ai.controller.js');
      const assignmentsData = await generateAssignments(mainTopic);

      const Assignment = (await import('../models/Assignment.js')).default;
      // We need an organizationId. If the user is an org student/admin, use their org.
      // If free user, maybe skip or assign to a default?
      // For now, check if user has organization

      if (creator && creator.organization) {
        const newAssignment = new Assignment({
          courseLikeId: newCourse._id,
          organizationId: creator.organization,
          topic: mainTopic,
          description: `Assignments for ${mainTopic}`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          generatedByAI: true,
          questions: assignmentsData
        });
        await newAssignment.save();
        console.log('Auto-generated assignment created');
      }
    } catch (assignErr) {
      console.error('Failed to auto-generate assignments:', assignErr);
      // Don't fail the course creation
    }

    res.json({
      success: true,
      message: 'Course created successfully',
      courseId: newCourse._id
    });
  } catch (error) {
    console.log('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * CREATE SHARED COURSE
 */
export const createSharedCourse = async (req, res) => {
  const { user, content, type, mainTopic } = req.body;

  try {
    const result = await unsplash.search.getPhotos({
      query: mainTopic,
      page: 1,
      perPage: 1,
      orientation: 'landscape'
    });

    const photo = result.response.results[0].urls.regular;

    const newCourse = new Course({
      user,
      content,
      type,
      mainTopic,
      photo
    });

    await newCourse.save();

    res.json({
      success: true,
      message: 'Course created successfully',
      courseId: newCourse._id
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * UPDATE COURSE
 */
export const updateCourse = async (req, res) => {
  const { content, courseId } = req.body;

  if (!content || !courseId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  try {
    const result = await Course.findOneAndUpdate(
      { _id: courseId },
      { $set: { content } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.log('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * DELETE COURSE
 */
export const deleteCourse = async (req, res) => {
  const { courseId } = req.body;

  try {
    await Course.findOneAndDelete({ _id: courseId });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

/**
 * FINISH COURSE
 */
export const finishCourse = async (req, res) => {
  const { courseId } = req.body;

  try {
    await Course.findOneAndUpdate(
      { _id: courseId },
      { $set: { completed: true, end: Date.now() } }
    );

    res.json({
      success: true,
      message: 'Course completed successfully'
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
export const getUserCourses = async (req, res) => {
  try {
    const { userId, page = 1, limit = 9 } = req.query;
    const skip = (page - 1) * limit;

    const courses = await Course.find({ user: userId })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const coursesWithCert = await Promise.all(
      courses.map(async (course) => {
        if (course.completed) {
          const cert = await IssuedCertificate.findOne({
            user: userId,
            course: course._id
          });
          if (cert) {
            return { ...course, certificateId: cert.certificateId };
          }
        }
        return course;
      })
    );

    res.json(coursesWithCert);
  } catch (error) {
    console.log('Error', error);
    res.status(500).send('Internal Server Error');
  }
};

/**
 * GET SHAREABLE COURSE
 */
export const getShareableCourse = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'ID is required' });

    // Try standard Course model first
    let course = await Course.findById(id).lean();

    if (course) {
      return res.json([course]);
    }

    // Try OrgCourse model
    course = await OrgCourse.findById(id).lean();
    if (course) {
      // Transform OrgCourse to match CoursePage expectations
      const transformedCourse = {
        _id: course._id,
        mainTopic: course.title,
        type: course.type || 'video & text course',
        photo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        content: JSON.stringify({
          course_title: course.title,
          course_details: course.description,
          course_topics: course.topics.map(t => ({
            title: t.title,
            subtopics: t.subtopics.map(s => ({
              title: s.title,
              theory: s.content,
              youtube: s.videoUrl,
              image: s.videoUrl // Fallback for image courses
            }))
          })),
          quizzes: course.quizzes
        })
      };
      return res.json([transformedCourse]);
    }

    res.status(404).json({ success: false, message: 'Course not found' });
  } catch (error) {
    console.error('getShareableCourse error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


