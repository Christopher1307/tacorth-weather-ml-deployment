import styled, { keyframes } from 'styled-components';
import sunSpinner from '../assets/sun_spinner.svg';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
`;

const SpinnerImage = styled.img`
  width: 120px;
  height: 120px;
  animation: ${spin} 3s linear infinite;
  filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.5));
`;

const LoadingText = styled.p`
  margin-top: 2rem;
  font-size: 1.2rem;
  color: #fbbf24;
  font-weight: 500;
  letter-spacing: 0.05em;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }
`;

const Loader = () => {
  return (
    <LoaderWrapper>
      <SpinnerImage src={sunSpinner} alt="Cargando..." />
      <LoadingText>Procesando datos meteorológicos...</LoadingText>
    </LoaderWrapper>
  );
};

export default Loader;
