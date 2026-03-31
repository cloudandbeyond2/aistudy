import GlobalSettings from '../models/GlobalSettings.js';

export const getGlobalInterviewSettings = async (req, res) => {
  try {
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = new GlobalSettings();
      await settings.save();
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGlobalInterviewSettings = async (req, res) => {
  try {
    const { interviewModule, aiSettings } = req.body;
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = new GlobalSettings();
    }
    
    if (interviewModule) settings.interviewModule = { ...settings.interviewModule, ...interviewModule };
    if (aiSettings) settings.aiSettings = { ...settings.aiSettings, ...aiSettings };
    settings.updatedAt = Date.now();
    
    await settings.save();
    res.status(200).json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
