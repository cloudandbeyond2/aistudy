import multer from 'multer';
import path from 'path';
import fs from 'fs';

/* =========================================================
   HELPER: CREATE FOLDER (LOCAL ONLY)
========================================================= */

const createFolderIfNotExists = (dirPath) => {
    if (!process.env.VERCEL) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
};

/* =========================================================
   1️⃣ ASSIGNMENT UPLOAD (PDF)
========================================================= */

const assignmentDir = 'uploads/assignments';
createFolderIfNotExists(assignmentDir);

const assignmentStorage = process.env.VERCEL
    ? multer.memoryStorage()
    : multer.diskStorage({
          destination: (req, file, cb) => {
              cb(null, assignmentDir);
          },
          filename: (req, file, cb) => {
              const uniqueSuffix =
                  Date.now() + '-' + Math.round(Math.random() * 1e9);
              cb(
                  null,
                  'assignment-' +
                      uniqueSuffix +
                      path.extname(file.originalname)
              );
          },
      });

export const uploadAssignment = multer({
    storage: assignmentStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed!'), false);
        }
        cb(null, true);
    },
});

/* =========================================================
   2️⃣ ORGANIZATION LOGO UPLOAD (Images)
========================================================= */

export const uploadLogo = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/svg+xml',
        ];
        if (!allowed.includes(file.mimetype)) {
            return cb(
                new Error(
                    'Only JPEG, JPG, PNG, and SVG files are allowed!'
                ),
                false
            );
        }
        cb(null, true);
    },
});

/* =========================================================
   3️⃣ COURSE IMAGE UPLOAD
========================================================= */

const courseImageDir = 'uploads/courses';
createFolderIfNotExists(courseImageDir);

const courseImageStorage = process.env.VERCEL
    ? multer.memoryStorage()
    : multer.diskStorage({
          destination: (req, file, cb) => {
              cb(null, courseImageDir);
          },
          filename: (req, file, cb) => {
              const uniqueSuffix =
                  Date.now() + '-' + Math.round(Math.random() * 1e9);
              cb(
                  null,
                  'course-' +
                      uniqueSuffix +
                      path.extname(file.originalname)
              );
          },
      });

export const uploadCourseImage = multer({
    storage: courseImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        if (!allowed.includes(file.mimetype)) {
            return cb(
                new Error(
                    'Only JPEG, JPG, PNG, GIF, and WebP allowed!'
                ),
                false
            );
        }
        cb(null, true);
    },
});

/* =========================================================
   4️⃣ MATERIAL UPLOAD (PDF ONLY)
========================================================= */

const materialDir = 'uploads/materials';
createFolderIfNotExists(materialDir);

const materialStorage = process.env.VERCEL
    ? multer.memoryStorage()
    : multer.diskStorage({
          destination: (req, file, cb) => {
              cb(null, materialDir);
          },
          filename: (req, file, cb) => {
              const uniqueSuffix =
                  Date.now() + '-' + Math.round(Math.random() * 1e9);
              cb(
                  null,
                  'material-' +
                      uniqueSuffix +
                      path.extname(file.originalname)
              );
          },
      });

export const uploadMaterial = multer({
    storage: materialStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed!'), false);
        }
        cb(null, true);
    },
});