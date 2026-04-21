const fs = require('fs');

const UPLOAD_DIRS = ['uploads', 'uploads/enhanced', 'logs'];

UPLOAD_DIRS.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
