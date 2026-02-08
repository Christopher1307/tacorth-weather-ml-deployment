import { useState } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const SectionTitle = styled.h3`
  color: #38bdf8;
  border-bottom: 2px solid #1e293b;
  padding-bottom: 0.5rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  
  &:first-of-type {
    margin-top: 0;
  }
`;

const FormGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #cbd5e1;
`;

const Input = styled.input`
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #fff;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
  }
  
  &[type="date"] {
    color-scheme: dark;
  }
`;

const Button = styled.button`
  margin-top: 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorMsg = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const defaultValues = {
    fecha_observacion: new Date().toISOString().split('T')[0],
    hum_maximo: 85.0,
    hum_media: 70.0,
    hum_minimo: 55.0,
    rad_maximo: 800.0,
    rad_total: 20.0,
    rain_total: 0.0,
    temp_media: 20.0,
    temp_minimo: 15.0,
    wsp_maximo: 10.0,
    wsp_media: 5.0,
    wsp_minimo: 0.0,
};

const PredictionForm = ({ onSubmit, error }) => {
    const [formData, setFormData] = useState(defaultValues);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'fecha_observacion' ? value : parseFloat(value)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <ErrorMsg>{JSON.stringify(error)}</ErrorMsg>}

            <SectionTitle>Fecha</SectionTitle>
            <InputWrapper>
                <Label>Fecha de Observación</Label>
                <Input
                    type="date"
                    name="fecha_observacion"
                    value={formData.fecha_observacion}
                    onChange={handleChange}
                    required
                />
            </InputWrapper>

            <SectionTitle>Temperatura (°C)</SectionTitle>
            <FormGroup>
                <InputWrapper>
                    <Label>Media</Label>
                    <Input type="number" step="0.1" name="temp_media" value={formData.temp_media} onChange={handleChange} required />
                </InputWrapper>
                <InputWrapper>
                    <Label>Mínima</Label>
                    <Input type="number" step="0.1" name="temp_minimo" value={formData.temp_minimo} onChange={handleChange} required />
                </InputWrapper>
            </FormGroup>

            <SectionTitle>Humedad (%)</SectionTitle>
            <FormGroup>
                <InputWrapper>
                    <Label>Máxima</Label>
                    <Input type="number" step="0.1" name="hum_maximo" value={formData.hum_maximo} onChange={handleChange} required />
                </InputWrapper>
                <InputWrapper>
                    <Label>Media</Label>
                    <Input type="number" step="0.1" name="hum_media" value={formData.hum_media} onChange={handleChange} required />
                </InputWrapper>
                <InputWrapper>
                    <Label>Mínima</Label>
                    <Input type="number" step="0.1" name="hum_minimo" value={formData.hum_minimo} onChange={handleChange} required />
                </InputWrapper>
            </FormGroup>

            <SectionTitle>Viento (m/s)</SectionTitle>
            <FormGroup>
                <InputWrapper>
                    <Label>Máximo</Label>
                    <Input type="number" step="0.1" name="wsp_maximo" value={formData.wsp_maximo} onChange={handleChange} required />
                </InputWrapper>
                <InputWrapper>
                    <Label>Medio</Label>
                    <Input type="number" step="0.1" name="wsp_media" value={formData.wsp_media} onChange={handleChange} required />
                </InputWrapper>
                <InputWrapper>
                    <Label>Mínimo</Label>
                    <Input type="number" step="0.1" name="wsp_minimo" value={formData.wsp_minimo} onChange={handleChange} required />
                </InputWrapper>
            </FormGroup>

            <SectionTitle>Radiación Solar</SectionTitle>
            <FormGroup>
                <InputWrapper>
                    <Label>Máxima (W/m²)</Label>
                    <Input type="number" step="0.1" name="rad_maximo" value={formData.rad_maximo} onChange={handleChange} required />
                </InputWrapper>
                <InputWrapper>
                    <Label>Total (MJ/m²)</Label>
                    <Input type="number" step="0.1" name="rad_total" value={formData.rad_total} onChange={handleChange} required />
                </InputWrapper>
            </FormGroup>

            <SectionTitle>Precipitación</SectionTitle>
            <InputWrapper>
                <Label>Lluvia Total (mm)</Label>
                <Input type="number" step="0.1" name="rain_total" value={formData.rain_total} onChange={handleChange} required />
            </InputWrapper>

            <Button type="submit">Predecir Temperatura Máxima</Button>
        </Form>
    );
};

export default PredictionForm;
