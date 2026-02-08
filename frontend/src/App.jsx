import { useState } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import PredictionForm from './components/PredictionForm'
import ResultDisplay from './components/ResultDisplay'
import Loader from './components/Loader'
import './index.css'

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: radial-gradient(circle at top right, #1e293b, #0f172a);
  color: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
`;

const Header = styled.header`
  margin-bottom: 3rem;
  text-align: center;
  
  h1 {
    font-size: 3rem;
    font-weight: 800;
    background: linear-gradient(135deg, #38bdf8 0%, #a855f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
    letter-spacing: -0.05em;
    filter: drop-shadow(0 0 20px rgba(56, 189, 248, 0.3));
  }

  p {
    color: #94a3b8;
    font-size: 1.1rem;
    margin-top: 0.5rem;
  }
`;

const ContentCard = styled.main`
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 24px;
  padding: 2.5rem;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.5), transparent);
  }
`;

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
    const [prediction, setPrediction] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handlePredict = async (data) => {
        setLoading(true)
        setError(null)
        setPrediction(null)

        try {
            const [response] = await Promise.all([
                axios.post(`${API_URL}/predict`, data, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 60000,
                }),
                new Promise(resolve => setTimeout(resolve, 1500))
            ])

            setPrediction(response.data)
        } catch (err) {
            console.error(err)

            const status = err?.response?.status
            const detail = err?.response?.data?.detail

            if (status) {
                setError(`Error ${status}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
            } else {
                setError(err?.message || "Error al conectar con el servidor")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container>
            <Header>
                <h1>Tacoronte AI</h1>
                <p>Predicción de Temperatura Máxima</p>
            </Header>

            <ContentCard>
                {loading ? (
                    <Loader />
                ) : prediction ? (
                    <ResultDisplay result={prediction} onReset={() => setPrediction(null)} />
                ) : (
                    <PredictionForm onSubmit={handlePredict} error={error} />
                )}
            </ContentCard>
        </Container>
    )
}

export default App
