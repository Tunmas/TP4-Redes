import React, { useState } from 'react';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";
import DOMPurify from 'dompurify';
import 'bootstrap/dist/css/bootstrap.min.css';

const UploadComponent = () => {
    const [file, setFile] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [waitingForResponse, setWaitingForResponse] = useState(false);
    const [progress, setProgress] = useState(0);
    const { getIdTokenClaims } = useAuth0();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setProgress(0);
        setWaitingForResponse(false); // Resetea el estado antes de la carga

        const formData = new FormData();
        formData.append('file', file);

        try {
            const tokenClaims = await getIdTokenClaims();
            const token = tokenClaims.__raw;

            setWaitingForResponse(true); // Indica que está esperando la respuesta de la IA

            const response = await axios.post('http://localhost:4000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            // Limpiar las marcas ```html del contenido y sanitizar el HTML
            const cleanedAnalysis = response.data.analysis.replace(/```html|```/g, '');
            setAnalysis(DOMPurify.sanitize(cleanedAnalysis));
            console.log('File uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading file:', error.response ? error.response.data : error.message);
        } finally {
            setUploading(false);
            setWaitingForResponse(false); // Resetea el estado de espera al recibir la respuesta
        }
    };

    return (
        <div className="container mt-5">
            <h3 className="text-center mb-4">Upload File for Analysis</h3>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                <div className="form-group mb-3">
                    <label className="form-label">Choose a file:</label>
                    <input type="file" className="form-control" onChange={handleFileChange} required />
                </div>
                {uploading && (
                    <div className="progress mb-3">
                        <div
                            className="progress-bar progress-bar-striped progress-bar-animated"
                            role="progressbar"
                            style={{ width: `${progress}%` }}
                        >
                            {progress}%
                        </div>
                    </div>
                )}
                <button type="submit" className="btn btn-primary w-100" disabled={uploading || !file}>
                    {uploading ? 'Uploading...' : 'Upload File'}
                </button>
            </form>

            {waitingForResponse && (
                <div className="alert alert-info mt-4">
                    <strong>Esperando respuesta de la IA...</strong>
                </div>
            )}

            {analysis && (
                <div className="mt-4 card p-3 shadow-sm">
                    <h2>Analisis:</h2>
                    <div dangerouslySetInnerHTML={{ __html: analysis }} />
                </div>
            )}
        </div>
    );
};

export default UploadComponent;
