import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Asegúrate de tener este archivo para los estilos

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [chatId, setChatId] = useState<string>('');
  const [ddosData, setDdosData] = useState<{probability?: number, justification: string}>({
    justification: '',
    probability: undefined
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            setText(event.target.result);
          }
        };
        reader.readAsText(selectedFile);
        setFile(selectedFile);
      } else {
        alert('Solo se permiten archivos .txt');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    // Simula un clic en el input de archivo oculto
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleSend = async () => {
    console.log('Texto enviado:', text);
    console.log('Archivo enviado:', file);
    try {
      let id = chatId
      if(!id){
        id = await startScanning();
      }
      console.log(chatId)
      const response = await axios.post('http://localhost:3000/add-logs', { id, logs: text });
      setDdosData(response.data);
      console.log('Respuesta:', response.data);
    } catch (error) {
      console.error('Error al enviar los datos:', error);
    }
  };

  const startScanning = async () =>{
    try {
      const response = await axios.post('http://localhost:3000/start-scan');
      setChatId(response.data);
      return response.data
    } catch(error){
      console.error('Error al iniciar escaneo:', error);
    }
  }

  const handleClear = () => {
      setText('');
      setFile(null);
      setDdosData({justification: '', probability: undefined});
  }

  return (
    <div className="app-container">
      <h1>Detector de ataques DDOS en dispositivo IoT</h1>
      <textarea
        rows={10}
        value={text}
        onChange={handleTextChange}
        placeholder="Escribe aquí los logs a analizar..."
        className="text-area"
      />
      <div className="separator">
        <hr />
        <span>o también</span>
        <hr />
      </div>
      <div 
        className="drop-area" 
        onDrop={handleDrop} 
        onDragOver={handleDragOver}
        onClick={handleClick} // Abre el selector de archivos al hacer clic
      >
        {file ? file.name : 'Arrastre aquí el archivo o haga clic para seleccionar'}
      </div>
      <input
        type="file" 
        accept='.txt'
        onChange={handleFileChange} 
        className="file-input" 
        id="file-input" // Agregar un ID para referenciarlo
        style={{ display: 'none' }} // Ocultar el input de archivo
      />
      <br />
      <button onClick={handleSend} className="button button-send">Enviar</button>
      <button onClick={handleClear} className="button button-clear">Limpiar</button>
      <div className="result-card" style={{ display: ddosData.probability !== undefined ? 'block' : 'none' }}>
        <h2>Resultados</h2>
        <p><strong>Justificación: </strong>{ddosData.justification}</p>
        <p className='highlighted-result'><strong>Probabilidad de un ataque DDOS:</strong> {`${ddosData.probability}%`}</p>
      </div>
    </div>
  );
}

export default App;