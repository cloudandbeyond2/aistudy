import Testimonial from '../models/Testimonial.js';

/**
 * GET APPROVED TESTIMONIALS (PUBLIC)
 */
export const getPublicTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ approved: true }).sort({
      featured: -1,
      createdAt: -1
    });

    res.json({ success: true, testimonials });
  } catch (error) {
    console.log('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * SUBMIT TESTIMONIAL
 */
export const submitTestimonial = async (req, res) => {
  try {
    const {
      userEmail,
      userName,
      message,
      rating,
      profession,
      photoUrl
    } = req.body;

    if (!userEmail || !userName || !message) {
      return res.json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const testimonial = new Testimonial({
      userEmail,
      userName,
      message,
      rating: rating || 5,
      profession: profession || '',
      photoUrl: photoUrl || '',
      approved: false
    });

    await testimonial.save();

    res.json({
      success: true,
      message:
        'Testimonial submitted successfully and is pending admin approval'
    });
  } catch (error) {
    console.log('Error submitting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * GET ALL TESTIMONIALS (ADMIN)
 */
export const getAdminTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({
      createdAt: -1
    });

    res.json({ success: true, testimonials });
  } catch (error) {
    console.log('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * UPDATE TESTIMONIAL (ADMIN)
 */
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, featured } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { approved, featured, updatedAt: new Date() },
      { new: true }
    );

    if (!testimonial) {
      return res.json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      testimonial
    });
  } catch (error) {
    console.log('Error updating testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * DELETE TESTIMONIAL (ADMIN)
 */
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    await Testimonial.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.log('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
