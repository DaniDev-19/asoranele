import app from './app.js';
import { connectDb } from './config/db.js';

const PORT = process.env.PORT || 4000;
const mode = process.env.NODE_ENV || "development";

async function serverStart () {
    try {
        await connectDb();

        app.listen( PORT, () => {
            console.log(`Servidor levantado exitosamente --> http://localhost:${PORT} en modo ${mode}`);
        });
        
    } catch (error) {
        console.error("Error al iniciar el servidor", error);
    }
};

await serverStart();