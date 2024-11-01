import React, { useState } from 'react';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";

const UploadComponent = () => {
    const [file, setFile] = useState(null);
    const { getIdTokenClaims } = useAuth0(); // Importar el hook

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('file', file);

        try {
            const tokenClaims = await getIdTokenClaims();
            const token = tokenClaims.__raw; // Obtener el token en bruto

            const response = await axios.post('http://localhost:4000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`, // Asegúrate de incluir el token
                },
            });
            console.log('File uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading file:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="file" onChange={handleFileChange} />
            <button type="submit">Upload File</button>
        </form>
    );
};

export default UploadComponent;
