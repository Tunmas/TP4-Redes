import React, { useState } from 'react';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";

const UploadComponent = () => {
    const [file, setFile] = useState(null);
    const [analysis, setAnalysis] = useState(null); // Estado para el análisis
    const { getIdTokenClaims } = useAuth0();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('file', file);

        try {
            const tokenClaims = await getIdTokenClaims();
            const token = tokenClaims.__raw;

            const response = await axios.post('http://localhost:4000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            // Actualizar el estado con el análisis
            setAnalysis(response.data.analysis);
            console.log('File uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading file:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload File</button>
            </form>

            {/* Mostrar el análisis si está disponible */}
            {analysis && (
                <div>
                    <h2>Análisis de Gemini:</h2>
                    <p>{analysis}</p>
                </div>
            )}
        </div>
    );
};

export default UploadComponent;
