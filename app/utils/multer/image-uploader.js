const express = require('express')
const path = require('path')
const multer = require('multer')
const fs = require('fs');
const { pool } = require('../../config/db.config');

const app = express()

const multerMiddleWareStorage = multer.diskStorage({
    destination: (req, res, callBack) => {
        callBack(null, 'uploads/')
    },
    filename: (req, file, callBack) => {
        // const originalname = file.originalname.replace(/\s/g, '_');
        // callBack(null, Date.now() + path.extname(originalname))
        const originalname = file.originalname.replace(/\s/g, ''); // Remove spaces
        const timestamp = Date.now();
        const extension = path.extname(originalname);
        callBack(null, `${path.basename(originalname, extension)}${timestamp}${extension}`);

    }
});
const fileFilter = (req, file, callBack) => {
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png','image/gif'];
    if (allowedFileTypes.includes(file.mimetype)) {
        callBack(null, true)
    } else {
        callBack(null, false)
    }
}
const upload = multer({
    storage: multerMiddleWareStorage,
    limits: {
        fileSize: 1000000000 // 1000000000 Bytes = 1000 MB 
    },
    fileFilter: fileFilter,
})

// const UploadImage = app.post('/', upload.single('image'), async (req, res) => {
//     try {
//         console.log("ahjdshds")
//         const userId = req.body.userId;
//         console.log(userId)
//         console.log(req.file)
//         const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]); // Fetch the user

//         if (rows.length === 0) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const user = rows[0];

//         // Delete the old image if it exists
//         if (user.profile_image && fs.existsSync(user.profile_image)) {
//             fs.unlinkSync(user.profile_image);
//         }

//         // Update the user with the new image path
//         const imagePath = req.file.path;
//         console.log(imagePath)
//         const result = await pool.query('UPDATE users SET profile_image = $1 WHERE user_id = $2 RETURNING *', [imagePath, userId]);
//         console.log("reewe")
//         console.log(result)

//         res.json({ path: result.rows });
//     }catch (error) {
//         res.send(error)
//     }
// })
const UploadImage = app.post('/', upload.single('file'), async (req, res) => {
    try {
        const userId = req.body.userId;
        const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]); // Fetch the user

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Store the file's URL, type, and ID in the database
        console.log(req.file)
        const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;
        const fileType = req.file.mimetype;
        const file_name = req.file.filename; // Use the filename as the file ID

        await pool.query('INSERT INTO files ( file_url, file_type, user_id,file_name) VALUES ($1, $2, $3, $4)', [ fileUrl, fileType, userId,file_name]);

        res.status(200).json({ message: 'File uploaded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// const DeleteFile = app.delete('/:fileId', async (req, res) => {
//     try {
//         const { fileId } = req.params;

//         // Delete the file from the database
//         const { rowCount } = await pool.query('DELETE FROM files WHERE file_id = $1', [fileId]);

//         if (rowCount === 0) {
//             return res.status(404).json({ message: 'File not found' });
//         }

//         // Delete the file from the server
//         fs.unlink(`./uploads/${fileId}`, err => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ message: 'Failed to delete file' });
//             }

//             res.status(200).json({ message: 'File deleted successfully' });
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// const ReplaceFile = app.put('/:fileId', upload.single('file'), async (req, res) => {
//     try {
//         const { fileId } = req.params;

//         // Delete the old file from the server
//         fs.unlink(`./uploads/${fileId}`, err => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ message: 'Failed to delete old file' });
//             }
//         });

//         // Store the new file's URL and type in the database
//         const fileUrl = `http://yourserver.com/uploads/${req.file.filename}`;
//         const fileType = req.file.mimetype;

//         await pool.query('UPDATE files SET file_id = $1, file_url = $2, file_type = $3 WHERE file_id = $4', [req.file.filename, fileUrl, fileType, fileId]);

//         res.status(200).json({ message: 'File replaced successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });
// module.exports = {
//     UploadImage,
//     DeleteFile,
//     ReplaceFile}
    module.exports =  UploadImage
       
