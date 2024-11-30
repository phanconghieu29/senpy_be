const Survey = require('../models/SurveyModel');
const path = require('path');

exports.create = async (req, res) => {
  try {
    console.log('Request body:', req.body); // In ra dữ liệu nhận được

    const { mentor_id, mentee_id, quality_score, collaboration_score, effectiveness_score, comments } = req.body;

    // Kiểm tra nếu dữ liệu còn thiếu
    if (!mentor_id || !mentee_id || !quality_score || !collaboration_score || !effectiveness_score) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const surveyData = {
      mentor_id,
      mentee_id,
      quality_score,
      collaboration_score,
      effectiveness_score,
      comments,
    };

    // Gọi hàm createSurvey để thêm dữ liệu vào DB
    await Survey.createSurvey(surveyData);

    // Trả về phản hồi thành công
    return res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      feedback: surveyData,
    });
  } catch (error) {
    console.error('Error creating Survey:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};


exports.getAll = async (req, res) => {
  try {
    const feedbacks = await Survey.getAllSurveys();
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};