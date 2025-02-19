import multer from 'multer';
import path from 'path';

// Crie esses diretórios se eles não existirem ainda
// src\uploads\produtos\
// src\uploads\funcionarios\

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'imagemProduto' ? 'uploads/produtos/' : 'uploads/funcionarios/';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Middleware de upload
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Erro: Arquivo deve ser uma imagem!');
  }
});

// Exportar o middleware
export default upload;
