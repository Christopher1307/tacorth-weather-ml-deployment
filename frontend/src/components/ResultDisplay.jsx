import styled from 'styled-components';

const Wrapper = styled.div`
  text-align: center;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ResultCard = styled.div`
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.3) 100%);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 20px;
  padding: 3rem;
  margin-bottom: 2rem;
  box-shadow: 0 0 40px rgba(56, 189, 248, 0.15);
`;

const TempValue = styled.h2`
  font-size: 5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #bae6fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
`;

const Label = styled.p`
  color: #94a3b8;
  font-size: 1.1rem;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const ModelInfo = styled.div`
  margin-top: 2rem;
  font-size: 0.8rem;
  color: #475569;
  font-family: monospace;
`;

const BackButton = styled.button`
  background: transparent;
  border: 1px solid #334155;
  color: #cbd5e1;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #94a3b8;
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ResultDisplay = ({ result, onReset }) => {
    return (
        <Wrapper>
            <ResultCard>
                <TempValue>{result.temp_maximo_pred.toFixed(1)}°C</TempValue>
                <Label>Temperatura Máxima Predicha</Label>

                <ModelInfo>
                    Modelo: {result.model_uri}
                </ModelInfo>
            </ResultCard>

            <BackButton onClick={onReset}>
                ← Realizar otra predicción
            </BackButton>
        </Wrapper>
    );
};

export default ResultDisplay;
