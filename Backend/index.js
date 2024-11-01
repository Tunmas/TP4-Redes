require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const jwks = require('jwks-rsa');
const httpProxy = require('http-proxy');
const http = require('http');
const multer = require('multer');
const totp = require('./totp.js');
const pdfParse = require('pdf-parse'); // Para procesar PDF
const XLSX = require('xlsx'); // Para procesar Excel
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Importar la API de Google Generative AI

// Crea una instancia de GoogleGenerativeAI fuera de la función
const API_KEY = process.env.GOOGLE_API_KEY; // Obtén la clave de API desde las variables de entorno
const genAI = new GoogleGenerativeAI(API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de autenticación JWT de Auth0
const verifyToken = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
});

// Configuración de multer para manejar la carga de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rutas protegidas
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'Protected route accessed', user: req.auth });
});

app.get('/totp', verifyToken, (req, res) => {
    const token = totp.generate();
    res.json({ token });
});

app.post('/totp/verify', verifyToken, (req, res) => {
    const { token } = req.body;
    const isValid = totp.verify(token);
    res.json({ isValid });
});

// Ruta para cargar y procesar archivos PDF y Excel
app.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileType = file.mimetype;

        if (fileType === 'application/pdf') {
            // Procesar PDF
            const data = await pdfParse(file.buffer);
            const analysis = await analyzeDataWithGemini(data.text); // Analizar el texto del PDF
            res.json({ message: 'PDF processed successfully', content: data.text, analysis: analysis });
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileType === 'application/vnd.ms-excel') {
            // Procesar Excel
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0]; // Usamos la primera hoja
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);

            // Convertir el array de objetos a una tabla
            const tableData = data.map(row => Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(', ')).join('\n');

            // Invocar a Gemini para el análisis
            const analysis = await analyzeDataWithGemini(tableData);

            res.json({ message: 'Excel processed successfully', content: data, analysis: analysis });
        } else {
            return res.status(400).json({ message: 'Unsupported file type' });
        }
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ message: 'Error processing file' });
    }
});

// Función para analizar los datos con Gemini
async function analyzeDataWithGemini(data) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = `Analiza los siguientes datos y proporciona un resumen conciso: ${data}`; // Ajusta el prompt para el texto del PDF

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error al generar contenido:', error);
        return 'Error al analizar los datos. Por favor, verifica tu conexión a internet y tu clave de API.';
    }
}

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ message: 'Token no válido o no proporcionado' });
    } else {
        next(err);
    }
});

// Iniciar el servidor en el puerto 4000
app.listen(4000, () => {
    console.log('Server started on port 4000');
});

// Configurar el servidor proxy en el puerto 8080
const proxy = httpProxy.createProxyServer({
    target: 'http://localhost:4000',
    changeOrigin: true,
});

http.createServer((req, res) => {
    proxy.web(req, res);
}).listen(8080, () => {
    console.log('Proxy server started on port 8080');
});
