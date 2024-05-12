import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads');
	},
	filename: function (req, file, cb) {
		let ext = path.extname(file.originalname);
		cb(null, Date.now() + ext);
	},
});

const upload = multer({
	storage: storage,
	fileFilter: function (req, file, callback) {
		if (
			file.mimetype == 'image/png' ||
			file.mimetype == 'image/jpg' ||
			file.mimetype == 'image/JPG' ||
			file.mimetype == 'image/PNG'
		) {
			console.log('file', file);
			callback(null, true);
		} else {
			console.log('only png and jpg supported');
			callback(null, false);
		}
	},
	limits: {
		fileSize: 1024 * 1024 * 2,
	},
});

export default upload;
